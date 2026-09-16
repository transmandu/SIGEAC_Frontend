"use client";

import { useCreateWorkshopDispatch } from "@/actions/mantenimiento/almacen/salida_taller/action";
import { useGetConversionByConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableId";
import { useGetConversionByGeneralArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByGeneralArticleId";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles";
import { useGetWorkshops } from "@/hooks/general/talleres/useGetWorkshops";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@/lib/zod-resolver";
import { useCallback, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { Article, Batch, GeneralArticle } from "@/types";
import {
  isCutComplete,
  type CutDraft,
} from "@/components/forms/mantenimiento/almacen/_components/CutCapturePanel";

interface BatchesWithCountProp extends Batch {
  articles: Article[];
  batch_id: number;
}

export type MsgLevel = "error" | "warn";
export type RowMsg = { msg: string; level: MsgLevel } | undefined;
export type ConversionTarget = "aero" | "general";
export type ItemCategory = "consumable" | "component" | "part" | "tool";

// El backend filtra Batch.category por su valor canónico en inglés
// (CONSUMABLE/COMPONENT/PART/TOOL, ya normalizado en BD); mandar la
// traducción en español da lista vacía porque esos alias solo se aceptan al
// GUARDAR un batch, no al filtrar (ver Batch::category() y la migración
// normalize_batch_categories en el backend).
const CATEGORY_LABEL: Record<ItemCategory, string> = {
  consumable: "consumable",
  component: "component",
  part: "part",
  tool: "tool",
};

type ConvState = {
  target: ConversionTarget | null;
  rowFieldId: string | null;
  rowIndex: number | null;
  articleId: number | null;
  generalArticleId: number | null;
  selected: any;
  input: string;
};

const CONV_INITIAL: ConvState = {
  target: null,
  rowFieldId: null,
  rowIndex: null,
  articleId: null,
  generalArticleId: null,
  selected: null,
  input: "",
};

export type RowConversion = {
  unitId: number;
  unitLabel: string;
  factor: number;
  baseLabel: string;
};

const CONVERSION_PRECISION = 12;

const CutSchema = z.object({
  piece_id: z.coerce.number(),
  input_mode: z.enum(["MEASURES", "MAGNITUDE"]),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  magnitude: z.coerce.number().optional(),
  unit_id: z.coerce.number().nullable().optional(),
});

const AeronauticalItemSchema = z.object({
  article_id: z.coerce.number(),
  quantity: z.coerce.number(),
  serial: z.string().nullable().optional(),
  batch_id: z.coerce.number().optional(),
  unit_id: z.coerce.number().nullable().optional(),
  cut: CutSchema.optional(),
});

const GeneralItemSchema = z.object({
  general_article_id: z.coerce.number(),
  quantity: z.coerce.number(),
  unit_id: z.coerce.number().nullable().optional(),
  cut: CutSchema.optional(),
});

const SERVER_ERROR_FIELDS = new Set([
  "workshop_id",
  "requested_by",
  "receiver",
  "authorizer",
  "justification",
]);

export const FormSchema = z
  .object({
    workshop_id: z
      .string({ message: "Debe seleccionar el taller." })
      .min(1, "Debe seleccionar el taller."),
    requested_by: z.string().optional(),
    receiver: z.string().optional(),
    authorizer: z.string().optional(),
    justification: z
      .string({ message: "Debe ingresar una justificación de la salida." })
      .min(1, "Debe ingresar una justificación de la salida."),
    aeronautical_articles: z.array(AeronauticalItemSchema).default([]),
    general_articles: z.array(GeneralItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const total =
      (data.aeronautical_articles?.length ?? 0) +
      (data.general_articles?.length ?? 0);
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar al menos un artículo.",
        path: ["aeronautical_articles"],
      });
    }
  });

export type FormSchemaType = z.infer<typeof FormSchema>;

export const aeroKey = (id: string) => `A:${id}`;
export const genKey = (id: string) => `G:${id}`;

export function useWorkshopDispatchForm(onClose: () => void) {
  const { user } = useAuth();
  const { selectedStation, selectedCompany } = useCompanyStore();

  const [openAdd, setOpenAdd] = useState(false);
  const [addCategory, setAddCategory] = useState<ItemCategory>("component");
  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({});
  const [msgByKey, setMsgByKey] = useState<Record<string, RowMsg>>({});
  const [convByKey, setConvByKey] = useState<Record<string, RowConversion>>({});
  const [convState, setConvState] = useState<ConvState>(CONV_INITIAL);
  const [cutByKey, setCutByKey] = useState<Record<string, CutDraft>>({});
  // Categoría con la que se agregó cada línea aeronáutica: la conversión de
  // unidades solo aplica a consumibles, igual que en el formulario genérico.
  const [categoryByAeroKey, setCategoryByAeroKey] = useState<
    Record<string, ItemCategory>
  >({});

  const { createWorkshopDispatch } = useCreateWorkshopDispatch();

  const { data: workshops, isLoading: isWorkshopsLoading } = useGetWorkshops(
    selectedCompany?.slug,
  );

  const { data: batches, isPending: isBatchesLoading } =
    useGetBatchesWithInWarehouseArticles({
      location_id: Number(selectedStation!),
      company: selectedCompany!.slug,
      category: CATEGORY_LABEL[addCategory],
    });

  const { data: hardwareRes, isLoading: isHardwareLoading } =
    useGetGeneralArticles();
  const hardwareArticles = useMemo<GeneralArticle[]>(
    () => hardwareRes ?? [],
    [hardwareRes],
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      workshop_id: "",
      requested_by: "",
      receiver: "",
      authorizer: "",
      justification: "",
      aeronautical_articles: [],
      general_articles: [],
    },
  });

  const { control, setValue } = form;
  const aeroFA = useFieldArray({ control, name: "aeronautical_articles" });
  const genFA = useFieldArray({ control, name: "general_articles" });

  const watchedAeroRaw = useWatch({ control, name: "aeronautical_articles" });
  const watchedGenRaw = useWatch({ control, name: "general_articles" });

  const watchedAero = useMemo(() => watchedAeroRaw ?? [], [watchedAeroRaw]);
  const watchedGen = useMemo(() => watchedGenRaw ?? [], [watchedGenRaw]);

  const aeroSelectedSet = useMemo(
    () => new Set(watchedAero.map((x) => Number(x.article_id))),
    [watchedAero],
  );
  const genSelectedSet = useMemo(
    () => new Set(watchedGen.map((x) => Number(x.general_article_id))),
    [watchedGen],
  );

  const aeroById = useMemo(() => {
    const map = new Map<number, Article>();
    batches?.forEach((b: BatchesWithCountProp) =>
      b.articles?.forEach((a) => {
        if (a?.id != null) map.set(a.id, a);
      }),
    );
    return map;
  }, [batches]);

  const aeroBatchNameById = useMemo(() => {
    const map = new Map<number, string>();
    batches?.forEach((b: BatchesWithCountProp) =>
      b.articles?.forEach((a) => {
        if (a?.id != null && b.name) map.set(a.id, b.name);
      }),
    );
    return map;
  }, [batches]);

  const genById = useMemo(() => {
    const map = new Map<number, GeneralArticle>();
    hardwareArticles.forEach((a) => map.set(a.id, a));
    return map;
  }, [hardwareArticles]);

  const getAeroMax = useCallback(
    (id: number) => aeroById.get(id)?.quantity || 0,
    [aeroById],
  );
  const getGenMax = useCallback(
    (id: number) => genById.get(id)?.quantity || 0,
    [genById],
  );

  const isAeroConsumable = useCallback(
    (fieldId: string) => categoryByAeroKey[aeroKey(fieldId)] === "consumable",
    [categoryByAeroKey],
  );

  const setRowMsg = useCallback(
    (key: string, msg: RowMsg) => setMsgByKey((p) => ({ ...p, [key]: msg })),
    [],
  );

  const validateAndClamp = useCallback(
    (key: string, raw: string, max: number, conv?: RowConversion) => {
      const n = parseFloat(raw || "0") || 0;
      if (!raw || n <= 0) {
        setRowMsg(key, {
          msg: "La cantidad debe ser mayor a 0",
          level: "error",
        });
        return raw;
      }
      const factor = conv?.factor ?? 1;
      const unitLabel = conv?.unitLabel ?? "";
      if (max > 0 && Number((n * factor).toFixed(CONVERSION_PRECISION)) > max) {
        const p = 10 ** CONVERSION_PRECISION;
        const capped = Math.floor((max / factor) * p) / p;
        setRowMsg(key, {
          msg: `Se ajustó al máximo disponible: ${capped}${unitLabel ? ` ${unitLabel}` : ""}`,
          level: "warn",
        });
        return String(capped);
      }
      setRowMsg(key, undefined);
      return raw;
    },
    [setRowMsg],
  );

  const commitAeroQty = useCallback(
    (index: number, fieldId: string) => {
      const key = aeroKey(fieldId);
      const conv = convByKey[key];
      const max = watchedAero[index]?.article_id
        ? getAeroMax(Number(watchedAero[index].article_id))
        : 0;
      const raw = qtyByKey[key] ?? "";
      const adjusted = validateAndClamp(key, raw, max, conv);
      setQtyByKey((p) => ({ ...p, [key]: adjusted }));
      setValue(
        `aeronautical_articles.${index}.quantity`,
        parseFloat(adjusted || "0") || 0,
      );
      setValue(`aeronautical_articles.${index}.unit_id`, conv?.unitId ?? null);
    },
    [qtyByKey, convByKey, setValue, getAeroMax, validateAndClamp, watchedAero],
  );

  const commitGenQty = useCallback(
    (index: number, fieldId: string) => {
      const key = genKey(fieldId);
      const conv = convByKey[key];
      const max = watchedGen[index]?.general_article_id
        ? getGenMax(Number(watchedGen[index].general_article_id))
        : 0;
      const raw = qtyByKey[key] ?? "";
      const adjusted = validateAndClamp(key, raw, max, conv);
      setQtyByKey((p) => ({ ...p, [key]: adjusted }));
      setValue(
        `general_articles.${index}.quantity`,
        parseFloat(adjusted || "0") || 0,
      );
      setValue(`general_articles.${index}.unit_id`, conv?.unitId ?? null);
    },
    [qtyByKey, convByKey, setValue, getGenMax, validateAndClamp, watchedGen],
  );

  const clearRowState = useCallback((key: string) => {
    setQtyByKey((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    setMsgByKey((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    setConvByKey((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    setCutByKey((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    setCategoryByAeroKey((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  }, []);

  const updateCutFor = useCallback(
    (
      target: ConversionTarget,
      index: number,
      fieldId: string,
      next: CutDraft,
    ) => {
      const key = target === "aero" ? aeroKey(fieldId) : genKey(fieldId);
      setCutByKey((p) => ({ ...p, [key]: next }));
      setRowMsg(key, undefined);

      const ready =
        next.piece_id !== null &&
        (next.input_mode === "MAGNITUDE"
          ? parseFloat(next.magnitude) > 0
          : parseFloat(next.length) > 0);

      const payload = ready
        ? {
            piece_id: next.piece_id!,
            input_mode: next.input_mode,
            length:
              next.input_mode === "MEASURES"
                ? parseFloat(next.length) || undefined
                : undefined,
            width:
              next.input_mode === "MEASURES" && next.width
                ? parseFloat(next.width)
                : undefined,
            magnitude:
              next.input_mode === "MAGNITUDE"
                ? parseFloat(next.magnitude) || undefined
                : undefined,
            unit_id: next.input_mode === "MEASURES" ? next.unit_id : undefined,
          }
        : undefined;

      if (target === "aero") {
        setValue(`aeronautical_articles.${index}.quantity`, 0);
        setValue(`aeronautical_articles.${index}.unit_id`, null);
        setValue(`aeronautical_articles.${index}.cut`, payload);
        return;
      }

      setValue(`general_articles.${index}.quantity`, 0);
      setValue(`general_articles.${index}.unit_id`, null);
      setValue(`general_articles.${index}.cut`, payload);
    },
    [setValue, setRowMsg],
  );

  const updateCut = useCallback(
    (index: number, fieldId: string, next: CutDraft) =>
      updateCutFor("general", index, fieldId, next),
    [updateCutFor],
  );

  const updateAeroCut = useCallback(
    (index: number, fieldId: string, next: CutDraft) =>
      updateCutFor("aero", index, fieldId, next),
    [updateCutFor],
  );

  const setToMaxAero = useCallback(
    (index: number, fieldId: string) => {
      const max = watchedAero[index]?.article_id
        ? getAeroMax(Number(watchedAero[index].article_id))
        : 0;
      const next = max > 0 ? String(max) : "0";
      const key = aeroKey(fieldId);
      setQtyByKey((p) => ({ ...p, [key]: next }));
      setConvByKey((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setRowMsg(key, undefined);
      setValue(
        `aeronautical_articles.${index}.quantity`,
        parseFloat(next) || 0,
      );
      setValue(`aeronautical_articles.${index}.unit_id`, null);
    },
    [watchedAero, getAeroMax, setRowMsg, setValue],
  );

  const setToMaxGen = useCallback(
    (index: number, fieldId: string) => {
      const max = watchedGen[index]?.general_article_id
        ? getGenMax(Number(watchedGen[index].general_article_id))
        : 0;
      const next = max > 0 ? String(max) : "0";
      const key = genKey(fieldId);
      setQtyByKey((p) => ({ ...p, [key]: next }));
      setConvByKey((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setRowMsg(key, undefined);
      setValue(`general_articles.${index}.quantity`, parseFloat(next) || 0);
      setValue(`general_articles.${index}.unit_id`, null);
    },
    [watchedGen, getGenMax, setRowMsg, setValue],
  );

  // ── Conversion ─────────────────────────────────────────────────────────

  const { data: aeroConversions, isLoading: isAeroConversionLoading } =
    useGetConversionByConsmable(
      convState.target === "aero" &&
        convState.articleId != null &&
        isAeroConsumable(convState.rowFieldId ?? "")
        ? convState.articleId
        : null,
      selectedCompany?.slug,
    );

  const { data: genConversions, isLoading: isGenConversionLoading } =
    useGetConversionByGeneralArticle(
      convState.generalArticleId,
      selectedCompany?.slug,
    );

  const activeConversions =
    convState.target === "general" ? genConversions : aeroConversions;
  const isActiveConversionLoading =
    convState.target === "general"
      ? isGenConversionLoading
      : isAeroConversionLoading;

  const activeBaseUnitLabel = useMemo(() => {
    if (convState.target === "general" && convState.generalArticleId != null) {
      return genById.get(convState.generalArticleId)?.general_primary_unit
        ?.label;
    }
    if (convState.target === "aero" && convState.articleId != null) {
      return aeroById.get(convState.articleId)?.unit ?? undefined;
    }
    return undefined;
  }, [
    convState.target,
    convState.generalArticleId,
    convState.articleId,
    genById,
    aeroById,
  ]);

  const closeConversion = useCallback(() => setConvState(CONV_INITIAL), []);

  const openConversionForAero = useCallback(
    (index: number, fieldId: string, articleId: number) => {
      if (!isAeroConsumable(fieldId)) return;
      setConvState({
        target: "aero",
        rowFieldId: fieldId,
        rowIndex: index,
        articleId,
        generalArticleId: null,
        selected: null,
        input: "",
      });
    },
    [isAeroConsumable],
  );

  const openConversionForGeneral = useCallback(
    (index: number, fieldId: string, generalArticleId: number) => {
      setConvState({
        target: "general",
        rowFieldId: fieldId,
        rowIndex: index,
        generalArticleId,
        articleId: null,
        selected: null,
        input: "",
      });
    },
    [],
  );

  const applyConversion = useCallback(() => {
    const {
      rowIndex,
      rowFieldId,
      target,
      articleId,
      generalArticleId,
      selected,
      input,
    } = convState;
    if (
      rowIndex == null ||
      rowFieldId == null ||
      !target ||
      !selected ||
      !input
    )
      return;

    const captured = parseFloat(input) || 0;
    const unitId = selected?.unit?.id ?? null;
    const unitLabel = selected?.unit?.label ?? "";
    if (unitId == null) return;

    const conv: RowConversion = {
      unitId,
      unitLabel,
      factor: selected.base_per_unit,
      baseLabel: activeBaseUnitLabel ?? "",
    };

    const isAero = target === "aero" && articleId != null;
    if (!isAero && generalArticleId == null) return;

    const key = isAero ? aeroKey(rowFieldId) : genKey(rowFieldId);
    const max = isAero ? getAeroMax(articleId!) : getGenMax(generalArticleId!);
    const adjusted = validateAndClamp(key, String(captured), max, conv);
    const qty = parseFloat(adjusted) || 0;

    setQtyByKey((p) => ({ ...p, [key]: adjusted }));
    setConvByKey((p) => ({ ...p, [key]: conv }));
    if (isAero) {
      setValue(`aeronautical_articles.${rowIndex}.quantity`, qty);
      setValue(`aeronautical_articles.${rowIndex}.unit_id`, unitId);
    } else {
      setValue(`general_articles.${rowIndex}.quantity`, qty);
      setValue(`general_articles.${rowIndex}.unit_id`, unitId);
    }
    setConvState((p) => ({ ...p, input: "" }));
  }, [
    convState,
    getAeroMax,
    getGenMax,
    setValue,
    validateAndClamp,
    activeBaseUnitLabel,
  ]);

  // ── Article add/remove ────────────────────────────────────────────────

  const removeAeroRow = useCallback(
    (index: number, fieldId: string) => {
      aeroFA.remove(index);
      clearRowState(aeroKey(fieldId));
      if (convState.target === "aero" && convState.rowFieldId === fieldId)
        closeConversion();
    },
    [aeroFA, clearRowState, convState, closeConversion],
  );

  const removeGenRow = useCallback(
    (index: number, fieldId: string) => {
      genFA.remove(index);
      clearRowState(genKey(fieldId));
      if (convState.target === "general" && convState.rowFieldId === fieldId)
        closeConversion();
    },
    [genFA, clearRowState, convState, closeConversion],
  );

  const handleAddAeronautical = useCallback(
    (article: Article, batchId?: number) => {
      if (!article?.id) return;
      const id = Number(article.id);
      if (aeroSelectedSet.has(id)) {
        const idx = watchedAero.findIndex((x) => Number(x.article_id) === id);
        if (idx >= 0 && aeroFA.fields[idx])
          removeAeroRow(idx, aeroFA.fields[idx].id);
        setOpenAdd(false);
        return;
      }
      aeroFA.append({
        article_id: id,
        quantity: 0,
        serial: article.serial ?? null,
        batch_id: batchId,
      });
      // La categoría con la que se agregó decide si esta fila admite
      // conversión de unidades: solo un consumible tiene equivalencias.
      setTimeout(() => {
        const field = aeroFA.fields[aeroFA.fields.length - 1];
        if (field)
          setCategoryByAeroKey((p) => ({
            ...p,
            [aeroKey(field.id)]: addCategory,
          }));
      }, 0);
      setOpenAdd(false);
    },
    [aeroSelectedSet, watchedAero, aeroFA, removeAeroRow, addCategory],
  );

  const handleAddGeneral = useCallback(
    (ga: GeneralArticle) => {
      if (!ga?.id) return;
      const id = Number(ga.id);
      if (genSelectedSet.has(id)) {
        const idx = watchedGen.findIndex(
          (x) => Number(x.general_article_id) === id,
        );
        if (idx >= 0 && genFA.fields[idx])
          removeGenRow(idx, genFA.fields[idx].id);
        setOpenAdd(false);
        return;
      }
      genFA.append({ general_article_id: id, quantity: 0 });
      setOpenAdd(false);
    },
    [genSelectedSet, watchedGen, genFA, removeGenRow],
  );

  // ── Validation ────────────────────────────────────────────────────────

  const hasBlockingQtyError = useMemo(
    () => Object.values(msgByKey).some((m) => m?.level === "error"),
    [msgByKey],
  );

  const hasInvalidQty = useMemo(() => {
    const rowInvalid = (key: string) => {
      const cut = cutByKey[key];
      if (cut) return !isCutComplete(cut);
      return (parseFloat(qtyByKey[key] ?? "0") || 0) <= 0;
    };

    return (
      aeroFA.fields.some((f) => rowInvalid(aeroKey(f.id))) ||
      genFA.fields.some((f) => rowInvalid(genKey(f.id)))
    );
  }, [aeroFA.fields, genFA.fields, qtyByKey, cutByKey]);

  // ── Submit ────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormSchemaType) => {
    for (let i = 0; i < data.aeronautical_articles.length; i++) {
      const item = data.aeronautical_articles[i];
      const key = aeroFA.fields[i]?.id ? aeroKey(aeroFA.fields[i].id) : null;

      const draft = key ? cutByKey[key] : undefined;
      if (draft) {
        if (!isCutComplete(draft)) {
          if (key)
            setRowMsg(key, {
              msg: "Indique la pieza y las medidas del trazo",
              level: "error",
            });
          return;
        }
        continue;
      }

      const max = getAeroMax(item.article_id);
      const conv = key ? convByKey[key] : undefined;
      const inBase = Number(
        (item.quantity * (conv?.factor ?? 1)).toFixed(CONVERSION_PRECISION),
      );
      if (item.quantity <= 0) {
        if (key)
          setRowMsg(key, {
            msg: "La cantidad debe ser mayor a 0",
            level: "error",
          });
        return;
      }
      if (max > 0 && inBase > max) {
        if (key)
          setRowMsg(key, {
            msg: `No puede exceder el disponible (${max}${conv?.baseLabel ? ` ${conv.baseLabel}` : ""})`,
            level: "error",
          });
        return;
      }
    }
    for (let i = 0; i < data.general_articles.length; i++) {
      const item = data.general_articles[i];
      const key = genFA.fields[i]?.id ? genKey(genFA.fields[i].id) : null;

      const draft = key ? cutByKey[key] : undefined;
      if (draft) {
        if (!isCutComplete(draft)) {
          if (key)
            setRowMsg(key, {
              msg: "Indique la pieza y las medidas del trazo",
              level: "error",
            });
          return;
        }
        continue;
      }

      const max = getGenMax(item.general_article_id);
      const conv = key ? convByKey[key] : undefined;
      const inBase = Number(
        (item.quantity * (conv?.factor ?? 1)).toFixed(CONVERSION_PRECISION),
      );
      if (item.quantity <= 0) {
        if (key)
          setRowMsg(key, {
            msg: "La cantidad debe ser mayor a 0",
            level: "error",
          });
        return;
      }
      if (max > 0 && inBase > max) {
        if (key)
          setRowMsg(key, {
            msg: `No puede exceder el disponible (${max}${conv?.baseLabel ? ` ${conv.baseLabel}` : ""})`,
            level: "error",
          });
        return;
      }
    }
    if (hasBlockingQtyError) return;

    let failed = false;

    await createWorkshopDispatch
      .mutateAsync({
        data: {
          workshop_id: Number(data.workshop_id),
          requested_by: data.requested_by || undefined,
          receiver: data.receiver || undefined,
          authorizer: data.authorizer || undefined,
          justification: data.justification,
          aeronautical_articles: data.aeronautical_articles,
          general_articles: data.general_articles,
        },
        company: selectedCompany!.slug,
      })
      .catch((error: any) => {
        failed = true;

        const fieldErrors = error?.response?.data?.errors;

        if (fieldErrors) {
          for (const [name, messages] of Object.entries(fieldErrors)) {
            if (!SERVER_ERROR_FIELDS.has(name)) continue;

            const message = Array.isArray(messages)
              ? messages[0]
              : String(messages);
            form.setError(name as keyof FormSchemaType, {
              type: "server",
              message,
            });
          }
        }
      });

    if (failed) return;

    onClose();
  };

  return {
    form,
    user,
    onSubmit,
    createWorkshopDispatch,
    openAdd,
    setOpenAdd,
    addCategory,
    setAddCategory,
    workshops,
    isWorkshopsLoading,
    batches,
    isBatchesLoading,
    hardwareArticles,
    isHardwareLoading,
    aeroFA,
    genFA,
    watchedAero,
    watchedGen,
    aeroSelectedSet,
    genSelectedSet,
    aeroById,
    genById,
    aeroBatchNameById,
    getAeroMax,
    getGenMax,
    isAeroConsumable,
    qtyByKey,
    setQtyByKey,
    msgByKey,
    convByKey,
    cutByKey,
    updateCut,
    updateAeroCut,
    commitAeroQty,
    commitGenQty,
    setToMaxAero,
    setToMaxGen,
    convState,
    setConvState,
    activeConversions,
    isActiveConversionLoading,
    activeBaseUnitLabel,
    closeConversion,
    openConversionForAero,
    openConversionForGeneral,
    applyConversion,
    handleAddAeronautical,
    handleAddGeneral,
    removeAeroRow,
    removeGenRow,
    hasBlockingQtyError,
    hasInvalidQty,
    aeronauticalCount: aeroFA.fields.length,
    generalCount: genFA.fields.length,
    disabledAdd: isBatchesLoading || isHardwareLoading,
  };
}
