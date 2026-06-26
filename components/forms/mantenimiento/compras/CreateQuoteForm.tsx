"use client";
import { useCreateQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageSearch } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { QuoteableRequisition } from "@/types/purchase/quote";
import { QuoteMetaSection } from "./_components/QuoteMetaSection";
import { QuoteBatchArticlesSection } from "./_components/QuoteBatchArticlesSection";
import { QuoteGeneralArticlesSection } from "./_components/QuoteGeneralArticlesSection";

export const LEAD_TIME_UNITS = [
  { value: "día", label: "Día(s)" },
  { value: "semana", label: "Semana(s)" },
  { value: "mes", label: "Mes(es)" },
  { value: "año", label: "Año(s)" },
] as const;

const FormSchema = z.object({
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
      unit_price: z
        .string()
        .regex(/^\d+(\.\d{0,2})?$/, "Precio inválido"),
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
    })
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
      unit_price: z
        .string()
        .regex(/^\d+(\.\d{0,2})?$/, "Precio inválido"),
      location_id: z.string().optional(),
      reference: z.string().optional(),
      lead_time_value: z.string().optional(),
      lead_time_unit: z.string().optional(),
      not_quoted: z.boolean().optional(),
      quote_justification: z.string().optional(),
    })
  ),
  vendor_id: z.string().optional(),
  location_id: z.string({ message: "Debe ingresar una ubicacion destino." }),
  quote_date: z.date({ message: "Debe ingresar una fecha de cotizacion." }),
  observation: z.string().optional(),
}).superRefine((data, ctx) => {
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
      { key: "unit_price", message: "El precio unitario es obligatorio." },
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
  });

  data.general_articles.forEach((article, index) => {
    if (article.not_quoted) return;

    const requiredFields: { key: keyof typeof article; message: string }[] = [
      { key: "variant_type", message: "La variante es obligatoria." },
      { key: "brand_model", message: "La marca/modelo es obligatoria." },
      { key: "quantity", message: "La cantidad es obligatoria." },
      { key: "unit", message: "La unidad es obligatoria." },
      { key: "unit_price", message: "El precio es obligatorio." },
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
  });
});

type FormSchemaType = z.infer<typeof FormSchema>;
export type QuoteArticleFormValues = FormSchemaType["articles"][number];
export type QuoteGeneralArticleFormValues = FormSchemaType["general_articles"][number];

/** An article needs a justification when it's excluded, or its quantity/unit was changed from the requisition's original. */
export function articleNeedsJustification(
  article: QuoteArticleFormValues | QuoteGeneralArticleFormValues
): boolean {
  if (article.not_quoted) return true;
  if (article.original_quantity !== undefined && article.quantity !== article.original_quantity) return true;
  if (article.original_unit !== undefined && (article.unit ?? "") !== (article.original_unit ?? "")) return true;
  return false;
}

export function CreateQuoteForm({
  onClose,
  req,
  initialData: _initialData,
}: {
  onClose: () => void;
  req: QuoteableRequisition;
  initialData?: unknown;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);
  const { data: conditions } = useGetConditions();
  const { createQuote } = useCreateQuote();

  const {
    data: vendors,
    isLoading: isVendorsLoading,
  } = useGetVendors(selectedCompany?.slug);

  const {
    mutate,
    data: locations,
  } = useGetLocationsByCompanyId();

  useEffect(() => {
    if (selectedCompany) mutate(Number(2));
  }, [selectedCompany, mutate]);

  const transformedArticles = req.batch.flatMap((batch) =>
    batch.batch_articles.map((article: any) => ({
      article_requisition_order_id: article.id as number | undefined,
      part_number: article.article_part_number,
      alt_part_number: article.article_alt_part_number ?? "",
      original_alt_part_number: article.article_alt_part_number ?? "",
      quantity: article.quantity,
      original_quantity: article.quantity,
      unit: article.unit ? article.unit.id.toString() : undefined,
      original_unit: article.unit ? article.unit.id.toString() : undefined,
      unit_price: "0",
      vendor_id: undefined,
      location_id: undefined,
      condition_id: undefined,
      reference: "",
      lead_time_value: "",
      lead_time_unit: "día",
      not_quoted: false,
      quote_justification: "",
      batch: {
        name: batch.name,
        category: batch.category ?? "",
      },
    }))
  );

  const transformedGeneralArticles = (req.general_articles ?? []).map((article: any) => ({
    general_article_requisition_order_id: article.id as number | undefined,
    description: article.description,
    variant_type: article.variant_type ?? "",
    brand_model: "",
    original_brand_model: "",
    quantity: article.quantity,
    original_quantity: article.quantity,
    unit: article.unit ? article.unit.id.toString() : undefined,
    original_unit: article.unit ? article.unit.id.toString() : undefined,
    unit_price: "0",
    location_id: undefined,
    reference: "",
    lead_time_value: "",
    lead_time_unit: "día",
    not_quoted: false,
    quote_justification: "",
  }));

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: req.justification || "",
      observation: "",
      articles: transformedArticles,
      general_articles: transformedGeneralArticles,
    },
  });

  const articles = useWatch({ control: form.control, name: "articles" });
  const generalArticles = useWatch({ control: form.control, name: "general_articles" });
  const headerVendorId = useWatch({ control: form.control, name: "vendor_id" });
  const headerLocationId = useWatch({ control: form.control, name: "location_id" });

  // Cascade the header vendor/location to every article whenever they change.
  // Per-article selects remain editable afterward — this only sets the default.
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
    [articles, generalArticles]
  );

  const onSubmit = async (data: FormSchemaType) => {
    const quotedArticles = data.articles.filter((a) => !a.not_quoted);
    const quotedGeneralArticles = data.general_articles.filter((a) => !a.not_quoted);

    if (quotedArticles.length === 0 && quotedGeneralArticles.length === 0) {
      toast.error("Debe cotizar al menos un artículo.");
      return;
    }

    const missingJustification =
      data.articles.some(
        (a) => articleNeedsJustification(a) && !a.quote_justification?.trim()
      ) ||
      data.general_articles.some(
        (a) => articleNeedsJustification(a) && !a.quote_justification?.trim()
      );
    if (missingJustification) {
      toast.error(
        "Debe justificar los artículos no cotizados o con cambios en cantidad/unidad."
      );
      return;
    }

    if (data.articles.some((a) => !a.article_requisition_order_id)) {
      toast.error(
        "Uno o más artículos no tienen un identificador válido de la requisición. Recargue la página e intente de nuevo."
      );
      return;
    }

    if (data.general_articles.some((a) => !a.general_article_requisition_order_id)) {
      toast.error(
        "Uno o más artículos generales no tienen un identificador válido de la requisición. Recargue la página e intente de nuevo."
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
        general_article_requisition_order_id: a.general_article_requisition_order_id ?? 0,
        is_not_quoted: !!a.not_quoted,
        quantity: a.not_quoted ? 0 : Number(a.quantity),
        unit_price: a.not_quoted ? 0 : Number(a.unit_price),
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
    await createQuote.mutateAsync({ data: formattedData, company: selectedCompany!.slug });
    onClose();
  };

  const onInvalid = () => {
    toast.error("Hay campos obligatorios sin completar. Revise los artículos marcados con *.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-5">

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
          <div className="flex items-center justify-between gap-6 rounded-md bg-muted/10 px-4 py-2 border border-border/40 min-w-[200px]">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Total general
            </span>
            <span className="font-mono text-xl font-semibold tabular-nums leading-none">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Enviar ── */}
        <div className="flex justify-center">
          <Button
            disabled={createQuote.isPending}
            type="submit"
            className="
              w-[400px] h-10 rounded-lg
              bg-teal-500/20 text-teal-900
              hover:bg-teal-500/30
              active:bg-teal-500/40
              border border-teal-500/30
              shadow-sm
              transition-colors
              flex items-center justify-center gap-2
              dark:bg-teal-400/10
              dark:text-teal-100
              dark:hover:bg-teal-400/20
              dark:border-teal-400/20
            "
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
        </div>
      </form>
    </Form>
  );
}
