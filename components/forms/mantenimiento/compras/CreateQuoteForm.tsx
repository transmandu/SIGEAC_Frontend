"use client";
import {
  useCreateQuote,
  useIssueQuoteDraft,
  useOpenQuoteDraft,
  useSaveQuoteDraft,
} from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@/lib/zod-resolver";
import { Loader2, PackageSearch, Save, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Quote, QuoteableRequisition } from "@/types/purchase/quote";
import type {
  ArticleQuoteOrder,
  GeneralArticleQuoteOrder,
  SaveQuoteDraftArticleData,
  SaveQuoteDraftGeneralArticleData,
} from "@/types/purchase/quote";
import { QuoteMetaSection } from "./_components/QuoteMetaSection";
import { QuoteBatchArticlesSection } from "./_components/QuoteBatchArticlesSection";
import { QuoteGeneralArticlesSection } from "./_components/QuoteGeneralArticlesSection";
import {
  IssueQuoteDraftDialog,
  type IssueDraftSummaryLine,
} from "./_components/IssueQuoteDraftDialog";

export const LEAD_TIME_UNITS = [
  { value: "día", label: "Día(s)" },
  { value: "semana", label: "Semana(s)" },
  { value: "mes", label: "Mes(es)" },
  { value: "año", label: "Año(s)" },
] as const;

const FormSchema = z
  .object({
    justification: z.string(),
    articles: z.array(
      z.object({
        article_requisition_order_id: z.number().optional(),
        part_number: z.string(),
        alt_part_number: z.string().optional(),
        original_alt_part_number: z.string().optional(),
        quantity: z.string().regex(/^\d+(\.\d{0,2})?$/),
        original_quantity: z.string().optional(),
        unit: z.string().optional(),
        original_unit: z.string().optional(),
        // El vacío es válido en el campo: representa "sin respuesta
        // todavía". Que una línea cotizada exija precio > 0 lo impone
        // el superRefine de abajo, y la emisión lo revalida en el backend.
        unit_price: z.string().regex(/^(\d+(\.\d{0,2})?)?$/, "Precio inválido"),
        vendor_id: z.string().optional(),
        location_id: z.string().optional(),
        condition_id: z.string().optional(),
        reference: z.string().optional(),
        lead_time_value: z.string().optional(),
        lead_time_unit: z.string().optional(),
        not_quoted: z.boolean().optional(),
        quote_justification: z.string().optional(),
        batch: z.object({
          name: z.string(),
          category: z.string(),
        }),
      }),
    ),
    general_articles: z.array(
      z.object({
        general_article_requisition_order_id: z.number().optional(),
        description: z.string(),
        variant_type: z.string().nullable().optional(),
        brand_model: z.string().optional(),
        original_brand_model: z.string().optional(),
        quantity: z.string().regex(/^\d+(\.\d{0,2})?$/),
        original_quantity: z.string().optional(),
        unit: z.string().optional(),
        original_unit: z.string().optional(),
        // El vacío es válido en el campo: representa "sin respuesta
        // todavía". Que una línea cotizada exija precio > 0 lo impone
        // el superRefine de abajo, y la emisión lo revalida en el backend.
        unit_price: z.string().regex(/^(\d+(\.\d{0,2})?)?$/, "Precio inválido"),
        location_id: z.string().optional(),
        reference: z.string().optional(),
        lead_time_value: z.string().optional(),
        lead_time_unit: z.string().optional(),
        not_quoted: z.boolean().optional(),
        quote_justification: z.string().optional(),
      }),
    ),
    vendor_id: z.string().optional(),
    location_id: z.string({ message: "Debe ingresar una ubicacion destino." }),
    quote_date: z.date({ message: "Debe ingresar una fecha de cotizacion." }),
    observation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.vendor_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar un proveedor.",
        path: ["vendor_id"],
      });
    }

    data.articles.forEach((article, index) => {
      if (article.not_quoted) return;

      const requiredFields: { key: keyof typeof article; message: string }[] = [
        { key: "quantity", message: "La cantidad es obligatoria." },
        { key: "unit", message: "La unidad es obligatoria." },
        { key: "part_number", message: "El número de parte es obligatorio." },
        { key: "vendor_id", message: "El proveedor es obligatorio." },
        { key: "condition_id", message: "La condición es obligatoria." },
        { key: "location_id", message: "El destino es obligatorio." },
      ];

      requiredFields.forEach(({ key, message }) => {
        if (!article[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message,
            path: ["articles", index, key],
          });
        }
      });

      if (!(Number(article.unit_price) > 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El precio unitario debe ser mayor a 0 para artículos cotizados.",
          path: ["articles", index, "unit_price"],
        });
      }
    });

    data.general_articles.forEach((article, index) => {
      if (article.not_quoted) return;

      const requiredFields: { key: keyof typeof article; message: string }[] = [
        { key: "brand_model", message: "La marca/modelo es obligatoria." },
        { key: "quantity", message: "La cantidad es obligatoria." },
        { key: "unit", message: "La unidad es obligatoria." },
        { key: "location_id", message: "El destino es obligatorio." },
      ];

      requiredFields.forEach(({ key, message }) => {
        if (!article[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message,
            path: ["general_articles", index, key],
          });
        }
      });

      if (!(Number(article.unit_price) > 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El precio debe ser mayor a 0 para artículos cotizados.",
          path: ["general_articles", index, "unit_price"],
        });
      }
    });
  });

type FormSchemaType = z.infer<typeof FormSchema>;
export type QuoteArticleFormValues = FormSchemaType["articles"][number];
export type QuoteGeneralArticleFormValues =
  FormSchemaType["general_articles"][number];

/** An article needs a justification when it's excluded, or its quantity/unit was changed from the requisition's original. */
export function articleNeedsJustification(
  article: QuoteArticleFormValues | QuoteGeneralArticleFormValues,
): boolean {
  if (article.not_quoted) return true;
  if (
    article.original_quantity !== undefined &&
    article.quantity !== article.original_quantity
  )
    return true;
  if (
    article.original_unit !== undefined &&
    (article.unit ?? "") !== (article.original_unit ?? "")
  )
    return true;
  return false;
}

export function CreateQuoteForm({
  onClose,
  req,
  draft,
  initialData: _initialData,
}: {
  onClose: () => void;
  req: QuoteableRequisition;
  /**
   * Borrador en curso sobre esta requisición. Con borrador, el formulario
   * guarda avance sin exigir precios completos y emite aparte; sin él, crea la
   * cotización completa de una sola vez (comportamiento original).
   */
  draft?: Quote | null;
  initialData?: unknown;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);
  const { data: conditions } = useGetConditions();
  const { createQuote } = useCreateQuote();
  const { openQuoteDraft } = useOpenQuoteDraft();
  const { saveQuoteDraft } = useSaveQuoteDraft();
  const { issueQuoteDraft } = useIssueQuoteDraft();

  // El borrador puede llegar ya abierto por props, o abrirse desde este mismo
  // formulario en el primer guardado; el id de props manda cuando existe, así
  // que solo se guarda en estado el que abre este formulario.
  const [openedDraftId, setOpenedDraftId] = useState<number | null>(null);
  const draftId = draft?.id ?? openedDraftId;
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  const { data: vendors, isLoading: isVendorsLoading } = useGetVendors(
    selectedCompany?.slug,
  );

  const { mutate, data: locations } = useGetLocationsByCompanyId();

  useEffect(() => {
    if (selectedCompany) mutate(Number(2));
  }, [selectedCompany, mutate]);

  /**
   * Lo ya capturado en el borrador, indexado por el artículo de requisición que
   * cotiza. Sin esto, reabrir un borrador mostraría el formulario vacío y el
   * siguiente guardado sobreescribiría los precios ya cargados.
   */
  const savedByArticle = useMemo(() => {
    const map = new Map<number, ArticleQuoteOrder>();
    for (const line of draft?.article_quote_order ?? []) {
      const key =
        line.article_requisition_order_id ?? line.article_requisition_order?.id;
      if (key) map.set(Number(key), line);
    }
    return map;
  }, [draft]);

  const savedByGeneralArticle = useMemo(() => {
    const map = new Map<number, GeneralArticleQuoteOrder>();
    for (const line of draft?.general_article_quote_order ?? []) {
      const key =
        line.general_article_requisition_order_id ??
        line.general_article_requisition_order?.id;
      if (key) map.set(Number(key), line);
    }
    return map;
  }, [draft]);

  /** "0" guardado significa "sin precio todavía", y se muestra vacío. */
  const asAmount = (value: string | number | null | undefined): string =>
    value === null || value === undefined || Number(value) === 0
      ? ""
      : String(Number(value));

  const splitLeadTime = (lead?: string | null) => {
    const [value = "", unit = "día"] = (lead ?? "").split(" ");
    return { value, unit };
  };

  const transformedArticles = req.batch.flatMap((batch) =>
    batch.batch_articles.map((article: any) => {
      const saved = article.id
        ? savedByArticle.get(Number(article.id))
        : undefined;
      const lead = splitLeadTime(saved?.lead_time);

      return {
        article_requisition_order_id: article.id as number | undefined,
        part_number: article.article_part_number,
        alt_part_number:
          saved?.deferred_alt_part_number ??
          article.article_alt_part_number ??
          "",
        original_alt_part_number: article.article_alt_part_number ?? "",
        quantity:
          saved && Number(saved.quantity) > 0
            ? String(Number(saved.quantity))
            : article.quantity,
        original_quantity: article.quantity,
        unit: saved?.unit?.id
          ? String(saved.unit.id)
          : article.unit
            ? article.unit.id.toString()
            : undefined,
        original_unit: article.unit ? article.unit.id.toString() : undefined,
        // Vacío y no "0": un precio sin responder todavía no es un precio de
        // cero. Confundirlos es lo que lleva a emitir una cotización con huecos
        // creyendo que está completa.
        unit_price: asAmount(saved?.unit_price),
        vendor_id: saved?.vendor?.id ? String(saved.vendor.id) : undefined,
        location_id: saved?.location?.id
          ? String(saved.location.id)
          : undefined,
        condition_id: saved?.condition?.id
          ? String(saved.condition.id)
          : undefined,
        reference: saved?.reference ?? "",
        lead_time_value: lead.value,
        lead_time_unit: lead.unit,
        not_quoted: !!saved?.is_not_quoted,
        quote_justification: saved?.justification ?? "",
        batch: {
          name: batch.name,
          category: batch.category ?? "",
        },
      };
    }),
  );

  const transformedGeneralArticles = (req.general_articles ?? []).map(
    (article: any) => {
      const saved = article.id
        ? savedByGeneralArticle.get(Number(article.id))
        : undefined;
      const lead = splitLeadTime(saved?.lead_time);

      return {
        general_article_requisition_order_id: article.id as number | undefined,
        description: article.description,
        variant_type: article.variant_type ?? "",
        brand_model: saved?.brand_model ?? "",
        original_brand_model: "",
        quantity:
          saved && Number(saved.quantity) > 0
            ? String(Number(saved.quantity))
            : article.quantity,
        original_quantity: article.quantity,
        unit: saved?.unit?.id
          ? String(saved.unit.id)
          : article.unit
            ? article.unit.id.toString()
            : undefined,
        original_unit: article.unit ? article.unit.id.toString() : undefined,
        unit_price: asAmount(saved?.unit_price),
        location_id: saved?.location?.id
          ? String(saved.location.id)
          : undefined,
        reference: saved?.reference ?? "",
        lead_time_value: lead.value,
        lead_time_unit: lead.unit,
        not_quoted: !!saved?.is_not_quoted,
        quote_justification: saved?.justification ?? "",
      };
    },
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: req.justification || "",
      observation: draft?.observation ?? "",
      articles: transformedArticles,
      general_articles: transformedGeneralArticles,
      // La cabecera también se retoma del borrador: sin esto, reabrirlo obligaba
      // a volver a elegir sede y proveedor, y la fecha guardada se perdía.
      ...(draft?.location_id ? { location_id: String(draft.location_id) } : {}),
      ...(draft?.vendor_id ? { vendor_id: String(draft.vendor_id) } : {}),
      ...(draft?.quote_date ? { quote_date: new Date(draft.quote_date) } : {}),
    },
  });

  const articles = useWatch({ control: form.control, name: "articles" });
  const generalArticles = useWatch({
    control: form.control,
    name: "general_articles",
  });
  const headerVendorId = useWatch({ control: form.control, name: "vendor_id" });
  const headerLocationId = useWatch({
    control: form.control,
    name: "location_id",
  });

  // El proveedor y la ubicación de la cabecera bajan a todos los artículos
  // como valor por defecto; cada uno sigue siendo editable después.
  useEffect(() => {
    if (!headerVendorId) return;
    form.getValues("articles").forEach((_, index) => {
      form.setValue(`articles.${index}.vendor_id`, headerVendorId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerVendorId]);

  useEffect(() => {
    if (!headerLocationId) return;
    form.getValues("articles").forEach((_, index) => {
      form.setValue(`articles.${index}.location_id`, headerLocationId);
    });
    form.getValues("general_articles").forEach((_, index) => {
      form.setValue(`general_articles.${index}.location_id`, headerLocationId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerLocationId]);

  const total = useMemo(
    () =>
      articles.reduce((sum, article) => {
        if (article.not_quoted) return sum;
        const qty = Number(article.quantity ?? 0);
        const price = Number(article.unit_price ?? 0);
        if (Number.isNaN(qty) || Number.isNaN(price)) return sum;
        return sum + qty * price;
      }, 0) +
      generalArticles.reduce((sum, article) => {
        if (article.not_quoted) return sum;
        const qty = Number(article.quantity ?? 0);
        const price = Number(article.unit_price ?? 0);
        if (Number.isNaN(qty) || Number.isNaN(price)) return sum;
        return sum + qty * price;
      }, 0),
    [articles, generalArticles],
  );

  /**
   * Una línea está "sin respuesta" cuando no tiene precio y tampoco se declaró
   * como no cotizada. No es lo mismo que un precio de 0: confundirlos es lo que
   * lleva a emitir una cotización con huecos sin darse cuenta.
   */
  const summaryLines = useMemo<IssueDraftSummaryLine[]>(() => {
    const fromArticles = articles.map((a) => ({
      label: a.part_number || "Artículo sin número de parte",
      notQuoted: !!a.not_quoted,
      total: a.not_quoted
        ? 0
        : Number(a.unit_price) > 0
          ? (Number(a.quantity) || 0) * Number(a.unit_price)
          : null,
    }));

    const fromGeneral = generalArticles.map((a) => ({
      label: a.description || "Artículo general sin descripción",
      notQuoted: !!a.not_quoted,
      total: a.not_quoted
        ? 0
        : Number(a.unit_price) > 0
          ? (Number(a.quantity) || 0) * Number(a.unit_price)
          : null,
    }));

    return [...fromArticles, ...fromGeneral];
  }, [articles, generalArticles]);

  const pendingLinesCount = summaryLines.filter(
    (line) => line.total === null && !line.notQuoted,
  ).length;

  /**
   * Payload de borrador: manda lo que haya, incluidos los campos vacíos.
   *
   * Las líneas se emparejan por `article_requisition_order_id`, NO por posición:
   * el formulario lista los artículos agrupados por lote y el backend crea las
   * líneas en el orden de la requisición, así que con artículos de lotes
   * intercalados las dos listas quedan en orden distinto y el precio se
   * guardaría en el artículo equivocado.
   *
   * `draftLines` se pasa explícitamente porque al abrir el borrador desde aquí
   * todavía no llegó por props.
   */
  const buildDraftPayload = useCallback(
    (data: FormSchemaType, draftLines?: Quote | null) => {
      const source = draftLines ?? draft;

      // Number(): el id del artículo de requisición llega como string en el JSON
      // (columna bigint de SQL Server), y Map.get() con clave numérica no
      // encontraría una clave string.
      const lineByRequisitionArticle = new Map(
        (source?.article_quote_order ?? [])
          .map((line) => {
            const key =
              line.article_requisition_order_id ??
              line.article_requisition_order?.id;
            return key ? ([Number(key), line] as const) : null;
          })
          .filter(
            (entry): entry is readonly [number, ArticleQuoteOrder] =>
              entry !== null,
          ),
      );

      const lineByRequisitionGeneral = new Map(
        (source?.general_article_quote_order ?? [])
          .map((line) => {
            const key =
              line.general_article_requisition_order_id ??
              line.general_article_requisition_order?.id;
            return key ? ([Number(key), line] as const) : null;
          })
          .filter(
            (entry): entry is readonly [number, GeneralArticleQuoteOrder] =>
              entry !== null,
          ),
      );

      const articlesPayload = data.articles
        .map((a): SaveQuoteDraftArticleData | null => {
          const line = a.article_requisition_order_id
            ? lineByRequisitionArticle.get(a.article_requisition_order_id)
            : undefined;
          if (!line) return null;

          return {
            id: line.id,
            is_not_quoted: !!a.not_quoted,
            quantity: a.quantity ? Number(a.quantity) : null,
            unit_price: a.unit_price ? Number(a.unit_price) : null,
            total: a.unit_price
              ? (Number(a.quantity) || 0) * Number(a.unit_price)
              : null,
            unit_id: a.unit ? Number(a.unit) : null,
            vendor_id: a.vendor_id ? Number(a.vendor_id) : null,
            location_id: a.location_id ? Number(a.location_id) : null,
            condition_id: a.condition_id ? Number(a.condition_id) : null,
            reference: a.reference || null,
            lead_time: a.lead_time_value
              ? `${a.lead_time_value} ${a.lead_time_unit ?? "día"}`
              : null,
            quote_justification: a.quote_justification || null,
            alt_part_number:
              a.alt_part_number &&
              a.alt_part_number !== a.original_alt_part_number
                ? a.alt_part_number
                : null,
          };
        })
        .filter((line): line is SaveQuoteDraftArticleData => line !== null);

      const generalPayload = data.general_articles
        .map((a): SaveQuoteDraftGeneralArticleData | null => {
          const line = a.general_article_requisition_order_id
            ? lineByRequisitionGeneral.get(
                a.general_article_requisition_order_id,
              )
            : undefined;
          if (!line) return null;

          return {
            id: line.id,
            is_not_quoted: !!a.not_quoted,
            quantity: a.quantity ? Number(a.quantity) : null,
            unit_price: a.unit_price ? Number(a.unit_price) : null,
            total: a.unit_price
              ? (Number(a.quantity) || 0) * Number(a.unit_price)
              : null,
            unit_id: a.unit ? Number(a.unit) : null,
            location_id: a.location_id ? Number(a.location_id) : null,
            brand_model:
              a.brand_model && a.brand_model !== a.original_brand_model
                ? a.brand_model
                : null,
            reference: a.reference || null,
            lead_time: a.lead_time_value
              ? `${a.lead_time_value} ${a.lead_time_unit ?? "día"}`
              : null,
            quote_justification: a.quote_justification || null,
          };
        })
        .filter(
          (line): line is SaveQuoteDraftGeneralArticleData => line !== null,
        );

      return {
        quote_date:
          data.quote_date instanceof Date
            ? data.quote_date.toISOString()
            : undefined,
        // La cabecera viaja también: al reabrir el borrador el proveedor y la
        // observación tienen que estar donde el comprador los dejó.
        vendor_id: data.vendor_id ? Number(data.vendor_id) : null,
        observation: data.observation || null,
        articles: articlesPayload,
        general_articles: generalPayload,
      };
    },
    [draft],
  );

  /**
   * Guarda avance sin validar completitud: es la razón de ser del borrador.
   * Se salta el resolver de zod a propósito, porque el esquema exige precios.
   */
  const handleSaveDraft = async () => {
    if (!selectedCompany) return;

    const data = form.getValues();
    // La fecha puede no estar elegida todavía: guardar un borrador no la exige,
    // y el schema solo la valida al enviar. Sin esta guarda, .toISOString()
    // sobre undefined reventaría el guardado.
    const quoteDate =
      data.quote_date instanceof Date
        ? data.quote_date.toISOString()
        : undefined;

    let id = draftId;
    // Las líneas recién creadas vienen en la respuesta de apertura: sin ellas no
    // hay con qué emparejar las del formulario.
    let openedDraft: Quote | null = null;

    // Las mutaciones relanzan el error (ya avisan con su propio toast), así que
    // se atrapa aquí para no mostrar además un "guardado" que no ocurrió.
    try {
      if (!id) {
        const opened = await openQuoteDraft.mutateAsync({
          data: {
            requisition_order_id: req.id,
            ...(quoteDate ? { quote_date: quoteDate } : {}),
          },
          company: selectedCompany.slug,
        });
        openedDraft = opened?.quote_order ?? null;
        id = openedDraft?.id ?? null;
        if (id) setOpenedDraftId(id);
      }

      if (!id) return;

      await saveQuoteDraft.mutateAsync({
        id,
        data: buildDraftPayload(data, openedDraft),
        company: selectedCompany.slug,
      });
    } catch {
      return;
    }

    toast.success("Borrador guardado", {
      description:
        pendingLinesCount > 0
          ? `Quedan ${pendingLinesCount} artículo(s) sin precio. Puedes volver cuando los tengas.`
          : "Ya puedes emitir la cotización cuando quieras.",
    });
  };

  const isSavingDraft = openQuoteDraft.isPending || saveQuoteDraft.isPending;

  const handleIssueDraft = async () => {
    if (!selectedCompany || !draftId) return;

    // El borrador se guarda antes de emitir, porque el backend emite lo
    // guardado y no lo que esté en el formulario sin enviar.
    //
    // Si cualquiera de los dos pasos falla (la emisión rechaza, por ejemplo,
    // una línea cotizada sin proveedor), el diálogo se cierra y el formulario
    // NO: el usuario vuelve a sus datos para corregir, con el toast de error
    // que ya emite la mutación.
    try {
      await saveQuoteDraft.mutateAsync({
        id: draftId,
        data: buildDraftPayload(form.getValues()),
        company: selectedCompany.slug,
      });

      await issueQuoteDraft.mutateAsync({
        id: draftId,
        company: selectedCompany.slug,
      });
    } catch {
      setIssueDialogOpen(false);
      return;
    }

    setIssueDialogOpen(false);
    onClose();
  };

  const onSubmit = async (data: FormSchemaType) => {
    const quotedArticles = data.articles.filter((a) => !a.not_quoted);
    const quotedGeneralArticles = data.general_articles.filter(
      (a) => !a.not_quoted,
    );

    if (quotedArticles.length === 0 && quotedGeneralArticles.length === 0) {
      toast.error("Debe cotizar al menos un artículo.");
      return;
    }

    const missingJustification =
      data.articles.some(
        (a) => articleNeedsJustification(a) && !a.quote_justification?.trim(),
      ) ||
      data.general_articles.some(
        (a) => articleNeedsJustification(a) && !a.quote_justification?.trim(),
      );
    if (missingJustification) {
      toast.error(
        "Debe justificar los artículos no cotizados o con cambios en cantidad/unidad.",
      );
      return;
    }

    if (data.articles.some((a) => !a.article_requisition_order_id)) {
      toast.error(
        "Uno o más artículos no tienen un identificador válido de la requisición. Recargue la página e intente de nuevo.",
      );
      return;
    }

    if (
      data.general_articles.some((a) => !a.general_article_requisition_order_id)
    ) {
      toast.error(
        "Uno o más artículos generales no tienen un identificador válido de la requisición. Recargue la página e intente de nuevo.",
      );
      return;
    }

    const formattedData = {
      quote_date: data.quote_date.toISOString(),
      total,
      location_id: Number(data.location_id),
      requisition_order_id: req.id,
      vendor_id: data.vendor_id ? Number(data.vendor_id) : null,
      observation: data.observation || null,
      articles: data.articles.map((a) => ({
        article_requisition_order_id: a.article_requisition_order_id ?? 0,
        is_not_quoted: !!a.not_quoted,
        quantity: a.not_quoted ? 0 : Number(a.quantity),
        unit_price: a.not_quoted ? 0 : Number(a.unit_price),
        total: a.not_quoted
          ? 0
          : (Number(a.quantity) || 0) * (Number(a.unit_price) || 0),
        unit_id: a.unit ? Number(a.unit) : undefined,
        vendor_id: a.vendor_id ? Number(a.vendor_id) : undefined,
        location_id: a.location_id ? Number(a.location_id) : undefined,
        condition_id: a.condition_id ? Number(a.condition_id) : undefined,
        reference: a.reference || undefined,
        lead_time: a.lead_time_value
          ? `${a.lead_time_value} ${a.lead_time_unit ?? "día"}`
          : undefined,
        alt_part_number:
          a.alt_part_number && a.alt_part_number !== a.original_alt_part_number
            ? a.alt_part_number
            : undefined,
        quote_justification: a.quote_justification || undefined,
      })),
      general_articles: data.general_articles.map((a) => ({
        general_article_requisition_order_id:
          a.general_article_requisition_order_id ?? 0,
        is_not_quoted: !!a.not_quoted,
        quantity: a.not_quoted ? 0 : Number(a.quantity),
        unit_price: a.not_quoted ? 0 : Number(a.unit_price),
        total: a.not_quoted
          ? 0
          : (Number(a.quantity) || 0) * (Number(a.unit_price) || 0),
        unit_id: a.unit ? Number(a.unit) : undefined,
        location_id: a.location_id ? Number(a.location_id) : undefined,
        brand_model:
          a.brand_model && a.brand_model !== a.original_brand_model
            ? a.brand_model
            : undefined,
        reference: a.reference || undefined,
        lead_time: a.lead_time_value
          ? `${a.lead_time_value} ${a.lead_time_unit ?? "día"}`
          : undefined,
        quote_justification: a.quote_justification || undefined,
      })),
    };
    await createQuote.mutateAsync({
      data: formattedData,
      company: selectedCompany!.slug,
    });
    onClose();
  };

  const onInvalid = () => {
    toast.error(
      "Hay campos obligatorios sin completar. Revise los artículos marcados con *.",
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-5"
      >
        <QuoteMetaSection
          form={form}
          req={req}
          vendors={vendors}
          isVendorsLoading={isVendorsLoading}
          locations={locations}
        />

        {transformedArticles.length > 0 && (
          <QuoteBatchArticlesSection
            form={form}
            units={units}
            vendors={vendors}
            locations={locations}
            conditions={conditions}
          />
        )}

        {transformedGeneralArticles.length > 0 && (
          <QuoteGeneralArticlesSection
            form={form}
            units={units}
            locations={locations}
          />
        )}

        {/* ── Total general ── */}
        <div className="flex justify-end pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-6 rounded-md bg-muted/10 px-4 py-2 border border-border/40 min-w-50">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Total general
            </span>
            <span className="font-mono text-xl font-semibold tabular-nums leading-none">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Enviar ── */}
        {/* Dos caminos: guardar avance (el borrador acepta precios
            incompletos) o emitir, que exige una decisión por artículo y no
            tiene vuelta atrás. El "crear cotización" de una sentada se
            conserva para quien ya tiene todos los precios. */}
        <div className="flex flex-col items-center gap-2">
          {pendingLinesCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {pendingLinesCount} artículo(s) sin precio ni marca de “no
              cotizado”. Puede guardar el borrador y volver después.
            </p>
          )}

          <div className="flex w-100 flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isSavingDraft}
              onClick={handleSaveDraft}
              className="h-10 flex-1 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isSavingDraft ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-4" />
                  Guardar borrador
                </>
              )}
            </Button>

            {draftId ? (
              <Button
                type="button"
                disabled={issueQuoteDraft.isPending}
                onClick={() => setIssueDialogOpen(true)}
                className="h-10 flex-1 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {issueQuoteDraft.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Send className="size-4" />
                    Emitir cotización
                  </>
                )}
              </Button>
            ) : (
              <Button
                disabled={createQuote.isPending}
                type="submit"
                className="h-10 flex-1 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {createQuote.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <PackageSearch className="size-4" />
                    Crear cotización
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      <IssueQuoteDraftDialog
        lines={summaryLines}
        total={total}
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
        onConfirm={handleIssueDraft}
        isPending={issueQuoteDraft.isPending || saveQuoteDraft.isPending}
      />
    </Form>
  );
}
