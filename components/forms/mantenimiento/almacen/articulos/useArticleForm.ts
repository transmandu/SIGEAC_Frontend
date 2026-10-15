"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArticleDocumentSelection,
  buildDocumentSelectionFromArticle,
  isDocumentSelectionDirty,
  extractCreatedArticleIds,
  useCreateArticle,
  useUpdateArticle,
  useSyncArticleDocumentRequirements,
  useUploadArticleDocuments,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { useCompanyStore } from "@/stores/CompanyStore";

import { serverFieldErrors } from "@/components/forms/mantenimiento/almacen/_components/form-feedback";

import {
  statusForDestination,
  type ArticleDestination,
  type EditingArticle,
} from "./types";

interface SubmitArgs {
  /** Payload ya armado por cada categoría. */
  payload: Record<string, any>;
  hasDocumentation?: boolean;
  /** Casillas que desvían el camino normal del artículo. */
  destination: ArticleDestination;
  /** Limpieza propia de la categoría tras crear. */
  afterCreate?: () => void;
  /** Recibe los errores por campo de un 422, para marcarlos en el formulario. */
  onFieldErrors?: (errors: Record<string, string[]>) => void;
}

/**
 * Ciclo de vida común de los formularios de artículo por lote.
 *
 * Reúne lo que las doce copias repetían: catálogos, documentación fuera de
 * react-hook-form, cálculo de `busy`/`canSave`, y el guardado. El `mode` solo
 * decide el estado con que nace el artículo.
 */
export const useArticleForm = ({
  category,
  articleType,
  initialData,
  isEditing,
  onEditSuccess,
  onStateChange,
  /** Fechas y demás estado local que RHF no ve, para detectar cambios al editar. */
  extraDirty,
}: {
  /** Categoría del lote: COMPONENT, PART, CONSUMABLE, TOOL. */
  category: string;
  /** Discriminador que espera el backend. */
  articleType: string;
  initialData?: EditingArticle;
  isEditing?: boolean;
  onEditSuccess?: () => void;
  onStateChange?: (state: { busy: boolean; canSave: boolean }) => void;
  extraDirty?: boolean;
}) => {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const {
    data: batches,
    isPending: batchesLoading,
    refetch: refetchBatches,
  } = useGetBatchesByCategory(category);

  const { data: manufacturers, isLoading: manufacturersLoading } =
    useGetManufacturers(companySlug);

  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { uploadArticleDocuments } = useUploadArticleDocuments();
  const { syncArticleDocumentRequirements } =
    useSyncArticleDocumentRequirements();

  // Al editar precarga los requerimientos documentales (pendientes y ya
  // consignados) para que el selector muestre su estado real.
  const [documents, setDocuments] = useState<ArticleDocumentSelection[]>(() =>
    buildDocumentSelectionFromArticle(initialData),
  );

  // La documentación vive fuera de react-hook-form: sin este contraste el
  // botón de guardar no se entera de que el usuario adjuntó un archivo. Es
  // estado y no ref porque documentsDirty se usa en el render (canSave).
  const [initialDocuments, setInitialDocuments] = useState<
    ArticleDocumentSelection[]
  >(() => buildDocumentSelectionFromArticle(initialData));

  const documentsDirty = isDocumentSelectionDirty(documents, initialDocuments);

  const reloadDocuments = useCallback((article?: EditingArticle) => {
    const reloaded = buildDocumentSelectionFromArticle(article);
    setInitialDocuments(reloaded);
    setDocuments(reloaded);
  }, []);

  const busy =
    batchesLoading ||
    manufacturersLoading ||
    createArticle.isPending ||
    updateArticle.isPending ||
    uploadArticleDocuments.isPending ||
    syncArticleDocumentRequirements.isPending;

  /**
   * Guarda el artículo y su documentación.
   *
   * Recibe el payload ya armado por cada categoría; aquí solo se le añade lo
   * que es igual para todas: estado, tipo y el ciclo de documentos.
   */
  const submit = useCallback(
    async ({
      payload,
      hasDocumentation,
      destination,
      afterCreate,
      onFieldErrors,
    }: SubmitArgs) => {
      if (!companySlug) return;

      const company = companySlug;

      // Un 422 del guardado es el servidor diciendo qué campo está mal: se
      // entrega al formulario para que lo marque. Solo el del propio guardado:
      // si la subida de documentos falla con 422 el artículo ya existe, y
      // tratarlo como error de campo dejaría el formulario lleno y sin
      // resetear sobre un artículo ya creado.
      const rejectedByField = (error: unknown) => {
        const fieldErrors = serverFieldErrors(error);
        if (!fieldErrors || !onFieldErrors) return false;

        onFieldErrors(fieldErrors);

        return true;
      };

      if (isEditing && initialData) {
        try {
          await updateArticle.mutateAsync({
            id: initialData.id,
            company,
            data: { ...payload, article_type: articleType },
          });
        } catch (error) {
          if (rejectedByField(error)) return;
          throw error;
        }

        // Al editar, desmarcar la casilla retira los requerimientos:
        // por eso se sincroniza siempre, no solo cuando hay archivos.
        const kept = hasDocumentation ? documents : [];

        await syncArticleDocumentRequirements.mutateAsync({
          company,
          keptTypeIds: kept.map((doc) => doc.typeId),
          existingRequirements: initialData.document_requirements ?? [],
        });

        if (kept.length > 0) {
          await uploadArticleDocuments.mutateAsync({
            company,
            articleId: Number(initialData.id),
            documents: kept,
          });
        }

        if (onEditSuccess) onEditSuccess();
        else
          router.push(
            `/${company}/almacen/inventario_articulos/gestion_inventario`,
          );

        return;
      }

      let response;

      try {
        response = await createArticle.mutateAsync({
          company,
          data: {
            ...payload,
            article_type: articleType,
            status: statusForDestination(destination),
          } as any,
        });
      } catch (error) {
        if (rejectedByField(error)) return;
        throw error;
      }

      if (hasDocumentation && documents.length > 0) {
        for (const articleId of extractCreatedArticleIds(response?.data)) {
          await uploadArticleDocuments.mutateAsync({
            company,
            articleId,
            documents,
          });
        }
      }

      setDocuments([]);
      afterCreate?.();
    },
    [
      articleType,
      createArticle,
      documents,
      initialData,
      isEditing,
      onEditSuccess,
      router,
      companySlug,
      syncArticleDocumentRequirements,
      updateArticle,
      uploadArticleDocuments,
    ],
  );

  /** Espeja la condición del botón, para los contextos que lo montan fuera. */
  const canSaveWith = useCallback(
    (formDirty: boolean, requiredFilled: boolean) =>
      isEditing
        ? !!selectedCompany && (formDirty || documentsDirty || !!extraDirty)
        : !!selectedCompany && requiredFilled,
    [documentsDirty, extraDirty, isEditing, selectedCompany],
  );

  const reportState = useCallback(
    (canSave: boolean) => onStateChange?.({ busy, canSave }),
    [busy, onStateChange],
  );

  return {
    company: selectedCompany?.slug,
    selectedCompany,
    batches,
    batchesLoading,
    refetchBatches,
    manufacturers,
    manufacturersLoading,
    documents,
    setDocuments,
    documentsDirty,
    reloadDocuments,
    busy,
    submit,
    canSaveWith,
    reportState,
    router,
  };
};

/** Notifica el estado al contexto que monta el botón fuera del formulario. */
export const useReportFormState = (
  report: (canSave: boolean) => void,
  canSave: boolean,
) => {
  useEffect(() => {
    report(canSave);
  }, [report, canSave]);
};
