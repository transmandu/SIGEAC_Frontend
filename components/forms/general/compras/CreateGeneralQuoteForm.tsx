"use client";
import {
  useCreateQuote,
  useIssueQuoteDraft,
  useOpenQuoteDraft,
  useSaveQuoteDraft,
} from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetRetailers } from "@/hooks/general/comercios/useGetRetailers";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@/lib/zod-resolver";
import { Loader2, PackageSearch, Save, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type {
  GeneralArticleQuoteOrder,
  Quote,
  QuoteableRequisition,
  SaveQuoteDraftGeneralArticleData,
} from "@/types/purchase/quote";
import { articleNeedsJustification } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { QuoteGeneralMetaSection } from "./_components/QuoteGeneralMetaSection";
import { QuoteGeneralArticlesSection } from "@/components/forms/mantenimiento/compras/_components/QuoteGeneralArticlesSection";
import {
  IssueQuoteDraftDialog,
  type IssueDraftSummaryLine,
} from "@/components/forms/mantenimiento/compras/_components/IssueQuoteDraftDialog";

const FormSchema = z
  .object({
    justification: z.string(),
    general_articles: z.array(
      z.object({
        general_article_requisition_order_id: z.number().optional(),
        description: z.string(),
        variant_type: z.string().optional(),
        brand_model: z.string().optional(),
        original_brand_model: z.string().optional(),
        retailer_id: z.string().optional(),
        quantity: z.string().regex(/^\d+(\.\d{0,2})?$/),
        original_quantity: z.string().optional(),
        unit: z.string().optional(),
        original_unit: z.string().optional(),
        // El vacío es válido en el campo: representa "sin respuesta
        // todavía". Que una línea cotizada exija precio > 0 lo impone
        // el superRefine de abajo, y la emisión lo revalida en el backend.
        unit_price: z
          .string()
          .regex(/^(\d+(\.\d{0,2})?)?$/, "Precio inválido"),
        location_id: z.string().optional(),
        reference: z.string().optional(),
        lead_time_value: z.string().optional(),
        lead_time_unit: z.string().optional(),
        not_quoted: z.boolean().optional(),
        quote_justification: z.string().optional(),
      }),
    ),
    retailer_id: z.string().optional(),
    location_id: z.string({ message: "Debe ingresar una ubicacion destino." }),
    quote_date: z.date({ message: "Debe ingresar una fecha de cotizacion." }),
    observation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.retailer_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar un lugar de compra.",
        path: ["retailer_id"],
      });
    }

    data.general_articles.forEach((article, index) => {
      if (article.not_quoted) return;

      const requiredFields: { key: keyof typeof article; message: string }[] = [
        { key: "brand_model", message: "La marca/modelo es obligatoria." },
        { key: "quantity", message: "La cantidad es obligatoria." },
        { key: "unit", message: "La unidad es obligatoria." },
        { key: "retailer_id", message: "El lugar de compra es obligatorio." },
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

export function CreateGeneralQuoteForm({
  onClose,
  req,
  draft,
}: {
  onClose: () => void;
  req: QuoteableRequisition;
  /**
   * Borrador en curso sobre esta requisición. Con borrador, el formulario
   * guarda avance sin exigir precios completos y emite aparte; sin él, crea la
   * cotización completa de una sola vez (comportamiento original).
   */
  draft?: Quote | null;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);
  const { data: retailers } = useGetRetailers(selectedCompany?.slug);
  const { createQuote } = useCreateQuote();
  const { openQuoteDraft } = useOpenQuoteDraft();
  const { saveQuoteDraft } = useSaveQuoteDraft();
  const { issueQuoteDraft } = useIssueQuoteDraft();

  // El borrador puede llegar ya abierto por props, o abrirse desde este mismo
  // formulario en el primer guardado; el id de props manda cuando existe.
  const [openedDraftId, setOpenedDraftId] = useState<number | null>(null);
  const draftId = draft?.id ?? openedDraftId;
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

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

  const transformedGeneralArticles = (req.general_articles ?? []).map(
    (article: any) => {
      const saved = article.id ? savedByArticle.get(Number(article.id)) : undefined;
      const lead = splitLeadTime(saved?.lead_time);

      return {
        general_article_requisition_order_id: article.id as number | undefined,
        description: article.description,
        variant_type: article.variant_type ?? "",
        brand_model: saved?.brand_model ?? "",
        original_brand_model: "",
        retailer_id: saved?.retailer?.id ? String(saved.retailer.id) : undefined,
        quantity: saved && Number(saved.quantity) > 0
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
        location_id: saved?.location?.id ? String(saved.location.id) : undefined,
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
      general_articles: transformedGeneralArticles,
      // La cabecera también se retoma del borrador: sin esto, reabrirlo obligaba
      // a volver a elegir sede y comercio, y la fecha guardada se perdía.
      ...(draft?.location_id
        ? { location_id: String(draft.location_id) }
        : {}),
      ...(draft?.retailer_id
        ? { retailer_id: String(draft.retailer_id) }
        : {}),
      ...(draft?.quote_date ? { quote_date: new Date(draft.quote_date) } : {}),
    },
  });

  const generalArticles = useWatch({
    control: form.control,
    name: "general_articles",
  });
  const headerLocationId = useWatch({
    control: form.control,
    name: "location_id",
  });
  const headerRetailerId = useWatch({
    control: form.control,
    name: "retailer_id",
  });

  // La ubicación de la cabecera baja a todos los artículos como valor por
  // defecto; cada uno sigue siendo editable después.
  useEffect(() => {
    if (!headerLocationId) return;
    form.getValues("general_articles").forEach((_, index) => {
      form.setValue(`general_articles.${index}.location_id`, headerLocationId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerLocationId]);

  // El lugar de compra de la cabecera baja a todos los artículos como valor
  // por defecto; se puede cambiar por artículo si la cotización mezcla varios.
  useEffect(() => {
    if (!headerRetailerId) return;
    form.getValues("general_articles").forEach((_, index) => {
      form.setValue(`general_articles.${index}.retailer_id`, headerRetailerId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerRetailerId]);

  const total = useMemo(
    () =>
      generalArticles.reduce((sum, article) => {
        if (article.not_quoted) return sum;
        const qty = Number(article.quantity ?? 0);
        const price = Number(article.unit_price ?? 0);
        if (Number.isNaN(qty) || Number.isNaN(price)) return sum;
        return sum + qty * price;
      }, 0),
    [generalArticles],
  );

  /**
   * Una línea está "sin respuesta" cuando no tiene precio y tampoco se declaró
   * como no cotizada. No es lo mismo que un precio de 0.
   */
  const summaryLines = useMemo<IssueDraftSummaryLine[]>(
    () =>
      generalArticles.map((a) => ({
        label: a.description || "Artículo sin descripción",
        notQuoted: !!a.not_quoted,
        total: a.not_quoted
          ? 0
          : Number(a.unit_price) > 0
            ? (Number(a.quantity) || 0) * Number(a.unit_price)
            : null,
      })),
    [generalArticles],
  );

  const pendingLinesCount = summaryLines.filter(
    (line) => line.total === null && !line.notQuoted,
  ).length;

  /**
   * Payload de borrador: manda lo que haya, incluidos los campos vacíos.
   *
   * Las líneas se emparejan por `general_article_requisition_order_id`, no por
   * posición: el orden del formulario y el del borrador no tienen por qué
   * coincidir, y un desajuste guardaría el precio en el artículo equivocado.
   */
  const buildDraftPayload = useCallback(
    (data: FormSchemaType, draftLines?: Quote | null) => {
      const source = draftLines ?? draft;

      // Number(): el id llega como string en el JSON (bigint de SQL Server).
      const lineByRequisitionArticle = new Map(
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

      const generalPayload = data.general_articles
        .map((a): SaveQuoteDraftGeneralArticleData | null => {
          const line = a.general_article_requisition_order_id
            ? lineByRequisitionArticle.get(
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
            retailer_id: a.retailer_id ? Number(a.retailer_id) : null,
            location_id: a.location_id ? Number(a.location_id) : null,
            // Se manda tal cual, sin comparar con original_brand_model: la
            // marca/modelo es un dato propio de la cotización (la requisición
            // general no lo tiene), así que en un borrador no es "un cambio"
            // sino el valor capturado — y compararlo impedía borrarlo.
            brand_model: a.brand_model || null,
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
        // La cabecera viaja también: al reabrir el borrador el comercio y la
        // observación tienen que estar donde el comprador los dejó.
        retailer_id: data.retailer_id ? Number(data.retailer_id) : null,
        observation: data.observation || null,
        general_articles: generalPayload,
      };
    },
    [draft],
  );

  const isSavingDraft = openQuoteDraft.isPending || saveQuoteDraft.isPending;

  /**
   * Guarda avance sin validar completitud: es la razón de ser del borrador.
   * Se salta el resolver de zod a propósito, porque el esquema exige precios.
   */
  const handleSaveDraft = async () => {
    if (!selectedCompany) return;

    const data = form.getValues();
    // La fecha puede no estar elegida todavía: guardar un borrador no la exige.
    const quoteDate =
      data.quote_date instanceof Date ? data.quote_date.toISOString() : undefined;

    let id = draftId;
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
          ? `Quedan ${pendingLinesCount} artículo(s) sin precio. Puede volver cuando los tenga.`
          : "Ya puede emitir la cotización cuando quiera.",
    });
  };

  const handleIssueDraft = async () => {
    if (!selectedCompany || !draftId) return;

    // El borrador se guarda antes de emitir, porque el backend emite lo
    // guardado y no lo que esté en el formulario sin enviar.
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
    const quotedGeneralArticles = data.general_articles.filter(
      (a) => !a.not_quoted,
    );

    if (quotedGeneralArticles.length === 0) {
      toast.error("Debe cotizar al menos un artículo.");
      return;
    }

    const missingJustification = data.general_articles.some(
      (a) => articleNeedsJustification(a) && !a.quote_justification?.trim(),
    );
    if (missingJustification) {
      toast.error(
        "Debe justificar los artículos no cotizados o con cambios en cantidad/unidad.",
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
      vendor_id: null,
      retailer_id: data.retailer_id ? Number(data.retailer_id) : null,
      observation: data.observation || null,
      articles: [],
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
        retailer_id: a.retailer_id ? Number(a.retailer_id) : undefined,
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
        <QuoteGeneralMetaSection
          form={form}
          req={req}
          locations={locations}
          retailers={retailers}
        />

        <QuoteGeneralArticlesSection
          form={form}
          units={units}
          locations={locations}
          retailers={retailers}
          showRetailerField
        />

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
