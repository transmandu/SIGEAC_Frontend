"use client";
import { useCreateQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetRetailers } from "@/hooks/general/comercios/useGetRetailers";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageSearch } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { QuoteableRequisition } from "@/types/purchase/quote";
import { articleNeedsJustification } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { QuoteGeneralMetaSection } from "./_components/QuoteGeneralMetaSection";
import { QuoteGeneralArticlesSection } from "@/components/forms/mantenimiento/compras/_components/QuoteGeneralArticlesSection";

const FormSchema = z.object({
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
  retailer_id: z.string().optional(),
  location_id: z.string({ message: "Debe ingresar una ubicacion destino." }),
  quote_date: z.date({ message: "Debe ingresar una fecha de cotizacion." }),
  observation: z.string().optional(),
}).superRefine((data, ctx) => {
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
      { key: "variant_type", message: "El campo Present. / Especif. es obligatorio." },
      { key: "brand_model", message: "La marca/modelo es obligatoria." },
      { key: "quantity", message: "La cantidad es obligatoria." },
      { key: "unit", message: "La unidad es obligatoria." },
      { key: "unit_price", message: "El precio es obligatorio." },
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
  });
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function CreateGeneralQuoteForm({
  onClose,
  req,
}: {
  onClose: () => void;
  req: QuoteableRequisition;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);
  const { data: retailers } = useGetRetailers(selectedCompany?.slug);
  const { createQuote } = useCreateQuote();

  const {
    mutate,
    data: locations,
  } = useGetLocationsByCompanyId();

  useEffect(() => {
    if (selectedCompany) mutate(Number(2));
  }, [selectedCompany, mutate]);

  const transformedGeneralArticles = (req.general_articles ?? []).map((article: any) => ({
    general_article_requisition_order_id: article.id as number | undefined,
    description: article.description,
    variant_type: article.variant_type ?? "",
    brand_model: "",
    original_brand_model: "",
    retailer_id: undefined,
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
      general_articles: transformedGeneralArticles,
    },
  });

  const generalArticles = useWatch({ control: form.control, name: "general_articles" });
  const headerLocationId = useWatch({ control: form.control, name: "location_id" });
  const headerRetailerId = useWatch({ control: form.control, name: "retailer_id" });

  // Cascade the header location to every article whenever it changes.
  // Per-article selects remain editable afterward — this only sets the default.
  useEffect(() => {
    if (!headerLocationId) return;
    form.getValues("general_articles").forEach((_, index) => {
      form.setValue(`general_articles.${index}.location_id`, headerLocationId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerLocationId]);

  // Cascade the header retailer (lugar de compra) to every article whenever it
  // changes — mirrors how the aeronautical form cascades its header vendor.
  // Per-article selects remain editable afterward for multi-retailer quotes.
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
    [generalArticles]
  );

  const onSubmit = async (data: FormSchemaType) => {
    const quotedGeneralArticles = data.general_articles.filter((a) => !a.not_quoted);

    if (quotedGeneralArticles.length === 0) {
      toast.error("Debe cotizar al menos un artículo.");
      return;
    }

    const missingJustification = data.general_articles.some(
      (a) => articleNeedsJustification(a) && !a.quote_justification?.trim()
    );
    if (missingJustification) {
      toast.error(
        "Debe justificar los artículos no cotizados o con cambios en cantidad/unidad."
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
      vendor_id: null,
      retailer_id: data.retailer_id ? Number(data.retailer_id) : null,
      observation: data.observation || null,
      articles: [],
      general_articles: data.general_articles.map((a) => ({
        general_article_requisition_order_id: a.general_article_requisition_order_id ?? 0,
        is_not_quoted: !!a.not_quoted,
        quantity: a.not_quoted ? 0 : Number(a.quantity),
        unit_price: a.not_quoted ? 0 : Number(a.unit_price),
        total: a.not_quoted ? 0 : (Number(a.quantity) || 0) * (Number(a.unit_price) || 0),
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
    await createQuote.mutateAsync({ data: formattedData, company: selectedCompany!.slug });
    onClose();
  };

  const onInvalid = () => {
    toast.error("Hay campos obligatorios sin completar. Revise los artículos marcados con *.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-5">

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
        />

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
                Crear cotización general
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
