"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

import {
    statusForDestination,
    type ArticleDestination,
    type EditingArticle,
} from "./types";

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

    const {
        data: batches,
        isPending: batchesLoading,
        refetch: refetchBatches,
    } = useGetBatchesByCategory(category);

    const { data: manufacturers, isLoading: manufacturersLoading } =
        useGetManufacturers(selectedCompany?.slug);

    const { createArticle } = useCreateArticle();
    const { updateArticle } = useUpdateArticle();
    const { uploadArticleDocuments } = useUploadArticleDocuments();
    const { syncArticleDocumentRequirements } = useSyncArticleDocumentRequirements();

    // Al editar precarga los requerimientos documentales (pendientes y ya
    // consignados) para que el selector muestre su estado real.
    const [documents, setDocuments] = useState<ArticleDocumentSelection[]>(() =>
        buildDocumentSelectionFromArticle(initialData),
    );

    // La documentación vive fuera de react-hook-form: sin este contraste el
    // botón de guardar no se entera de que el usuario adjuntó un archivo.
    const initialDocumentsRef = useRef(buildDocumentSelectionFromArticle(initialData));
    const documentsDirty = isDocumentSelectionDirty(documents, initialDocumentsRef.current);

    const reloadDocuments = useCallback((article?: EditingArticle) => {
        const reloaded = buildDocumentSelectionFromArticle(article);
        initialDocumentsRef.current = reloaded;
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
        }: {
            payload: Record<string, any>;
            hasDocumentation?: boolean;
            /** Casillas que desvían el camino normal del artículo. */
            destination: ArticleDestination;
            /** Limpieza propia de la categoría tras crear. */
            afterCreate?: () => void;
        }) => {
            if (!selectedCompany?.slug) return;

            const company = selectedCompany.slug;

            if (isEditing && initialData) {
                await updateArticle.mutateAsync({
                    id: initialData.id,
                    company,
                    data: { ...payload, article_type: articleType },
                });

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
                else router.push(`/${company}/almacen/inventario_articulos/gestion_inventario`);

                return;
            }

            const response = await createArticle.mutateAsync({
                company,
                data: {
                    ...payload,
                    article_type: articleType,
                    status: statusForDestination(destination),
                } as any,
            });

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
            selectedCompany?.slug,
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
