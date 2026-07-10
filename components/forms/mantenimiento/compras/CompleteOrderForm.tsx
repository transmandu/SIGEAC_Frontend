"use client";

import { useCompletePurchase, useMarkPurchaseOrderAsCompleted } from "@/actions/mantenimiento/compras/ordenes_compras/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetPaymentOptions } from "@/hooks/general/cuentas_bancarias/useGetPaymentOptions";
import { useGetPaymentMethods } from "@/hooks/general/metodos_pago/useGetPaymentMethods";
import { useGetShippingAgencies } from "@/hooks/general/agencias_envio/useGetShippingAgencies";
import { cn } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/purchase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ClipboardCheck, FileCheck2, Loader2, Paperclip, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AmountInput } from "../../../misc/AmountInput";

const LABEL_CLS = "select-none text-[10px] leading-none text-muted-foreground uppercase";

const INPUT_CLS =
  "h-9 rounded-lg border-border/50 bg-background/80 text-sm shadow-sm transition-shadow focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:ring-offset-0";

const SELECT_TRIGGER_CLS =
  "h-9 rounded-lg border-border/50 bg-background/80 text-sm shadow-sm focus:ring-1 focus:ring-teal-500/40 focus:ring-offset-0";

interface InvoiceAttachmentProps {
  value?: File | string;
  onChange: (file: File | undefined) => void;
}

function InvoiceAttachment({ value, onChange }: InvoiceAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
    e.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-teal-500/30 bg-teal-500/10 text-teal-700 shadow-sm hover:bg-teal-500/20 dark:text-teal-300"
                  >
                    <FileCheck2 className="size-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Ver / cambiar factura</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent className="w-[220px] p-3 space-y-2">
            <div className="relative w-full h-40">
              <Image
                src={value instanceof File ? URL.createObjectURL(value) : value}
                alt="Preview"
                fill
                className="rounded-md object-contain"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" type="button" variant="destructive" onClick={() => onChange(undefined)}>
                <Trash2 className="size-3.5 mr-1" /> Eliminar
              </Button>
              <Button size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                Cambiar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border/50 bg-background/80 text-muted-foreground shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adjuntar factura</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}

const FormSchema = z.object({
  tax: z.string(),
  wire_fee: z.string(),
  handling_fee: z.string(),
  shipping_fee: z.string(),
  international_shipping: z.string(),
  // Flujo de pago: SIEMPRE arranca por el método (catálogo fijo); según el
  // método aparece condicionalmente la tarjeta (que determina su cuenta) o
  // la cuenta bancaria. Opcionales aquí: una orden previa a la reingeniería
  // puede completarse sin re-registrar el pago.
  payment_method_id: z.string().optional(),
  bank_account_id: z.string().optional(),
  bank_card_id: z.string().optional(),
  shipping_agency_id: z.string().optional(),
  invoice_number: z.string().optional(),
  observation: z.string().optional(),
  invoice: z.instanceof(File).optional(),
  articles_purchase_orders: z.array(
    z.object({
      article_purchase_order_id: z.number(),
      label: z.string(),
      quoted_total: z.number(),
      total: z.string().regex(/^\d+(\.\d{0,2})?$/, "Total inválido"),
      total_justification: z.string().optional(),
      shipping_tracking: z.string(),
      international_shipping_tracking: z.string(),
    })
  ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  po: PurchaseOrder;
  /** Wire Fee no aplica al ámbito aeronáutico — se oculta el campo en ese caso. */
  isAeronautical?: boolean;
}

export function CompleteOrderForm({ onClose, po, isAeronautical = false }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: paymentMethods, isLoading: isMethodsLoading } = useGetPaymentMethods();
  const { data: paymentOptions } = useGetPaymentOptions(selectedCompany?.id);
  const { data: shippingAgencies, isLoading: isAgenciesLoading } = useGetShippingAgencies(selectedCompany?.slug);
  const { completePurchase } = useCompletePurchase();
  const { markPurchaseOrderAsCompleted } = useMarkPurchaseOrderAsCompleted();

  const articleRows = useMemo(
    () => [
      ...po.article_purchase_order.map((article) => {
        const quote = article.article_quote_order;
        const quantity = Number(quote?.quantity ?? 0);
        const unitPrice = Number(quote?.unit_price ?? 0);
        const quotedTotal = quote?.total != null ? Number(quote.total) : quantity * unitPrice;
        return {
          article_purchase_order_id: article.id,
          label: quote?.article_requisition_order?.article_part_number ?? `Artículo #${article.id}`,
          batchName: article.batch?.name ?? null,
          batchCategory: article.batch?.category ?? null,
          quantity,
          unitPrice,
          quotedTotal,
          total: article.total != null ? Number(article.total) : quotedTotal,
          totalJustification: article.total_justification ?? "",
          unitLabel: article.unit?.label ?? null,
          shipping_tracking: article.shipping_tracking ?? "",
          international_shipping_tracking: article.international_shipping_tracking ?? "",
        };
      }),
      ...po.general_article_purchase_order.map((article) => {
        const quote = article.general_article_quote_order;
        const quantity = Number(quote?.quantity ?? 0);
        const unitPrice = Number(quote?.unit_price ?? 0);
        const quotedTotal = quote?.total != null ? Number(quote.total) : quantity * unitPrice;
        return {
          article_purchase_order_id: article.id,
          label: quote?.general_article_requisition_order?.description ?? `Artículo #${article.id}`,
          batchName: null,
          batchCategory: null,
          quantity,
          unitPrice,
          quotedTotal,
          total: article.total != null ? Number(article.total) : quotedTotal,
          totalJustification: article.total_justification ?? "",
          unitLabel: null,
          shipping_tracking: article.shipping_tracking ?? "",
          international_shipping_tracking: article.international_shipping_tracking ?? "",
        };
      }),
    ],
    [po.article_purchase_order, po.general_article_purchase_order]
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tax: po.tax != null ? String(po.tax) : "",
      wire_fee: po.wire_fee != null ? String(po.wire_fee) : "",
      handling_fee: po.handling_fee != null ? String(po.handling_fee) : "",
      shipping_fee: po.shipping_fee != null ? String(po.shipping_fee) : "",
      international_shipping: po.international_shipping != null ? String(po.international_shipping) : "",
      payment_method_id: po.payment_method ? String(po.payment_method.id) : "",
      bank_account_id: po.bank_account ? String(po.bank_account.id) : "",
      bank_card_id: po.bank_card ? String(po.bank_card.id) : "",
      shipping_agency_id: po.shipping_agency ? String(po.shipping_agency.id) : "",
      invoice_number: po.invoice_number ?? "",
      observation: po.observation ?? "",
      articles_purchase_orders: articleRows.map((article) => ({
        article_purchase_order_id: article.article_purchase_order_id,
        label: article.label,
        quoted_total: article.quotedTotal,
        total: article.total.toFixed(2),
        total_justification: article.totalJustification,
        shipping_tracking: article.shipping_tracking,
        international_shipping_tracking: article.international_shipping_tracking,
      })),
    },
  });

  const { tax, wire_fee, handling_fee, shipping_fee, international_shipping, articles_purchase_orders } = form.watch();

  const subTotal = useMemo(
    () =>
      (articles_purchase_orders ?? []).reduce((sum, article) => {
        const value = Number(article.total);
        return sum + (Number.isNaN(value) ? 0 : value);
      }, 0),
    [articles_purchase_orders]
  );
  const selectedMethodId = form.watch("payment_method_id");
  const selectedCardId = form.watch("bank_card_id");
  const effectiveWireFee = isAeronautical ? 0 : Number(wire_fee || 0);

  // ── Flujo de pago: método → tarjeta / cuenta (condicional) ───────────────
  const cardsForMethod = useMemo(() => {
    if (!paymentOptions || !selectedMethodId) return [];
    return paymentOptions.flatMap((account) =>
      (account.bank_cards ?? [])
        .filter((card) => card.payment_method_id.toString() === selectedMethodId)
        .map((card) => ({ ...card, bank_account: account }))
    );
  }, [paymentOptions, selectedMethodId]);

  const accountsForMethod = useMemo(() => {
    if (!paymentOptions || !selectedMethodId) return [];
    return paymentOptions.filter((account) =>
      (account.payment_methods ?? []).some((method) => method.id.toString() === selectedMethodId)
    );
  }, [paymentOptions, selectedMethodId]);

  const selectedCard = useMemo(
    () => cardsForMethod.find((card) => card.id.toString() === selectedCardId),
    [cardsForMethod, selectedCardId]
  );

  const total = useMemo(() => {
    return (
      subTotal +
      Number(tax || 0) +
      effectiveWireFee +
      Number(handling_fee || 0) +
      Number(shipping_fee || 0) +
      Number(international_shipping || 0)
    );
  }, [subTotal, tax, effectiveWireFee, handling_fee, shipping_fee, international_shipping]);

  const onSubmit = async (data: FormSchemaType) => {
    // Si el método tiene tarjetas registradas, hay que indicar cuál se usó;
    // si no tiene tarjetas pero sí cuentas habilitadas, hay que indicar la cuenta.
    if (data.payment_method_id && cardsForMethod.length > 0 && !data.bank_card_id) {
      form.setError("bank_card_id", { message: "Debe seleccionar la tarjeta utilizada." });
      return;
    }

    if (data.payment_method_id && cardsForMethod.length === 0 && accountsForMethod.length > 0 && !data.bank_account_id) {
      form.setError("bank_account_id", { message: "Debe seleccionar la cuenta utilizada." });
      return;
    }

    const missingJustification = data.articles_purchase_orders.some(
      (article) => Number(article.total) !== article.quoted_total && !article.total_justification?.trim()
    );
    if (missingJustification) {
      toast.error("Debe justificar los artículos cuyo total difiere del monto cotizado.");
      return;
    }

    const wireFee = isAeronautical ? 0 : Number(data.wire_fee || 0);

    const computedSubTotal = data.articles_purchase_orders.reduce(
      (sum, article) => sum + Number(article.total || 0),
      0
    );

    const computedTotal =
      computedSubTotal +
      Number(data.tax || 0) +
      wireFee +
      Number(data.handling_fee || 0) +
      Number(data.shipping_fee || 0) +
      Number(data.international_shipping || 0);

    await completePurchase.mutateAsync({
      id: po.id,
      data: {
        tax: Number(data.tax || 0),
        wire_fee: wireFee,
        handling_fee: Number(data.handling_fee || 0),
        shipping_fee: Number(data.shipping_fee || 0),
        international_shipping: Number(data.international_shipping || 0),
        sub_total: computedSubTotal,
        total: computedTotal,
        // La tarjeta determina su cuenta; sin método (orden previa a la
        // reingeniería) se preserva la cuenta que ya tenía la orden.
        payment_method_id: data.payment_method_id ? Number(data.payment_method_id) : null,
        bank_account_id: selectedCard
          ? selectedCard.bank_account_id
          : (data.bank_account_id
            ? Number(data.bank_account_id)
            : (! data.payment_method_id && po.bank_account ? po.bank_account.id : null)),
        bank_card_id: selectedCard ? selectedCard.id : null,
        shipping_agency_id: data.shipping_agency_id ? Number(data.shipping_agency_id) : null,
        invoice_number: data.invoice_number || null,
        observation: data.observation || null,
        invoice: data.invoice,
        articles_purchase_orders: data.articles_purchase_orders.map((article) => ({
          article_purchase_order_id: article.article_purchase_order_id,
          total: Number(article.total),
          total_justification: article.total_justification || null,
          shipping_tracking: article.shipping_tracking || null,
          international_shipping_tracking: article.international_shipping_tracking || null,
        })),
      },
      company: selectedCompany!.slug,
    });

    await markPurchaseOrderAsCompleted.mutateAsync({
      id: po.id,
      company: selectedCompany!.slug,
    });

    onClose();
  };

  const isPending = completePurchase.isPending || markPurchaseOrderAsCompleted.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >

        {/* ── Artículos ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground select-none">Artículos</span>
            <span className="text-xs text-muted-foreground tabular-nums select-none">
              {articleRows.length} {articleRows.length === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          <ScrollArea className={cn("w-full", articleRows.length > 1 && "h-[300px]")}>
            <div className="space-y-2 pr-1">
              {articleRows.map((article, index) => (
                <div
                  key={article.article_purchase_order_id}
                  className="rounded-lg border border-border/60 bg-background/60 overflow-hidden"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-3 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-medium text-foreground select-none">
                        {article.batchName || "Artículo"}
                      </span>
                      {article.batchCategory && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground select-none"
                        >
                          {article.batchCategory}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="relative px-3 py-2.5">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-x-3 gap-y-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] px-1.5 py-[2px] rounded-md bg-teal-500/10 text-teal-700 border border-teal-500/20 shrink-0 select-none">
                          P/N
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">
                          {article.label}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className={LABEL_CLS}>Cantidad</span>
                        <span className="flex h-7 items-center text-sm tabular-nums">
                          {article.quantity}{article.unitLabel ? ` ${article.unitLabel}` : ""}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className={LABEL_CLS}>Precio unitario</span>
                        <span className="flex h-7 items-center text-sm tabular-nums">${article.unitPrice.toFixed(2)}</span>
                      </div>

                      <FormField
                        control={form.control}
                        name={`articles_purchase_orders.${index}.total`}
                        render={({ field }) => {
                          const currentValue = Number(
                            form.watch(`articles_purchase_orders.${index}.total`)
                          );
                          const differs = !Number.isNaN(currentValue) && currentValue !== article.quotedTotal;
                          return (
                            <FormItem className="flex flex-col gap-0.5 space-y-0">
                              <span className={cn(LABEL_CLS, differs && "text-amber-600 dark:text-amber-400")}>
                                Total {differs && `(cotizado $${article.quotedTotal.toFixed(2)})`}
                              </span>
                              <FormControl>
                                <AmountInput
                                  className={cn(
                                    INPUT_CLS,
                                    "h-7",
                                    differs && "border-amber-500/60 bg-amber-50/70 dark:bg-amber-900/20"
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    {Number(form.watch(`articles_purchase_orders.${index}.total`)) !== article.quotedTotal && (
                      <div className="mt-2.5 border-t border-amber-500/30 bg-amber-50/40 -mx-3 px-3 py-2 dark:bg-amber-900/10">
                        <span className="select-none text-[10px] leading-none text-amber-700 dark:text-amber-400 uppercase">
                          Justificación de la diferencia
                        </span>
                        <FormField
                          control={form.control}
                          name={`articles_purchase_orders.${index}.total_justification`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Explique el motivo de la diferencia con el monto cotizado..."
                                  className="mt-1 min-h-[50px] resize-none border-amber-500/40 bg-background/70 text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border/40 pt-2.5">
                      <FormField
                        control={form.control}
                        name={`articles_purchase_orders.${index}.shipping_tracking`}
                        render={({ field }) => (
                          <FormItem>
                            <span className={LABEL_CLS}>Tracking nacional</span>
                            <FormControl>
                              <Input
                                placeholder="Tracking #"
                                className={cn(INPUT_CLS, "h-8 font-mono text-xs mt-0.5")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`articles_purchase_orders.${index}.international_shipping_tracking`}
                        render={({ field }) => (
                          <FormItem>
                            <span className={LABEL_CLS}>Tracking int&apos;l</span>
                            <FormControl>
                              <Input
                                placeholder="Tracking #"
                                className={cn(INPUT_CLS, "h-8 font-mono text-xs mt-0.5")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Costos de compra + Pago ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Costos de compra */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground select-none">
              Costos de compra
            </span>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL_CLS}>Tax</FormLabel>
                    <FormControl>
                      <AmountInput placeholder="$0.00" className={INPUT_CLS} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isAeronautical && (
                <FormField
                  control={form.control}
                  name="wire_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={LABEL_CLS}>Wire Fee</FormLabel>
                      <FormControl>
                        <AmountInput placeholder="$0.00" className={INPUT_CLS} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="handling_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL_CLS}>Handling Fee</FormLabel>
                    <FormControl>
                      <AmountInput placeholder="$0.00" className={INPUT_CLS} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL_CLS}>Envío nacional</FormLabel>
                    <FormControl>
                      <AmountInput placeholder="$0.00" className={INPUT_CLS} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="international_shipping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL_CLS}>Envío internacional</FormLabel>
                    <FormControl>
                      <AmountInput placeholder="$0.00" className={INPUT_CLS} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_agency_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={LABEL_CLS}>Agencia de envío</FormLabel>
                    <Select disabled={isAgenciesLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={SELECT_TRIGGER_CLS}>
                          <SelectValue placeholder="Seleccionar agencia..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shippingAgencies?.map((agency) => (
                          <SelectItem value={agency.id.toString()} key={agency.id} className="text-sm">
                            {agency.name} ({agency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pago */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground select-none">
              Pago
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* 1. Método de pago: catálogo fijo del sistema, siempre primero */}
              <FormField
                control={form.control}
                name="payment_method_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={LABEL_CLS}>Método de pago</FormLabel>
                    <Select
                      disabled={isMethodsLoading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Cambiar de método invalida tarjeta y cuenta elegidas.
                        form.setValue("bank_card_id", "");
                        form.setValue("bank_account_id", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={SELECT_TRIGGER_CLS}>
                          <SelectValue placeholder={isMethodsLoading ? "Cargando..." : "Seleccionar método..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods?.map((method) => (
                          <SelectItem value={method.id.toString()} key={method.id} className="text-sm">
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2a. Tarjeta: si el método tiene tarjetas válidas para la
                  compañía, se elige la tarjeta y su cuenta queda determinada */}
              {cardsForMethod.length > 0 && (
                <FormField
                  control={form.control}
                  name="bank_card_id"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className={LABEL_CLS}>Tarjeta</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={SELECT_TRIGGER_CLS}>
                            <SelectValue placeholder="Seleccionar tarjeta..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cardsForMethod.map((card) => (
                            <SelectItem value={card.id.toString()} key={card.id} className="text-sm">
                              {card.name} ({card.card_number}) — {card.bank_account.name} · {card.bank_account.bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Cuenta determinada por la tarjeta elegida: se muestra, no se elige */}
              {selectedCard && (
                <div className="col-span-2 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  <span>
                    Cuenta: <span className="font-medium text-foreground/90">{selectedCard.bank_account.name}</span>
                    {" "}
                    <span className="font-mono">(***{selectedCard.bank_account.account_number})</span>
                    {" — "}
                    {selectedCard.bank_account.bank.name}
                  </span>
                </div>
              )}

              {/* 2b. Cuenta: si el método no tiene tarjetas pero sí cuentas
                  habilitadas (p. ej. Transferencia, Pago Móvil) */}
              {cardsForMethod.length === 0 && accountsForMethod.length > 0 && (
                <FormField
                  control={form.control}
                  name="bank_account_id"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className={LABEL_CLS}>Cuenta bancaria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={SELECT_TRIGGER_CLS}>
                            <SelectValue placeholder="Seleccionar cuenta..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountsForMethod.map((account) => (
                            <SelectItem value={account.id.toString()} key={account.id} className="text-sm">
                              {account.name} ({account.account_number}) — {account.bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Nro. de factura + Invoice attachment */}
              <div className="col-span-2 grid grid-cols-5 gap-3">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem className="col-span-4">
                      <FormLabel className={LABEL_CLS}>Nro. Factura</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="INV-0001"
                          className={INPUT_CLS}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice"
                  render={({ field: { onChange, value } }) => (
                    <FormItem className="col-span-1">
                      <FormLabel className={LABEL_CLS}>Factura</FormLabel>
                      <FormControl>
                        <div className="flex h-9 items-center">
                          <InvoiceAttachment value={value ?? po.invoice ?? undefined} onChange={onChange} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Total general ── */}
        <div className="flex justify-end pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-6 rounded-md bg-muted/10 px-4 py-2 border border-border/40 min-w-[220px]">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                Total general
              </span>
              <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                Subtotal ${subTotal.toFixed(2)}
              </span>
            </div>
            <span className="font-mono text-xl font-semibold tabular-nums leading-none">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Enviar ── */}
        <div className="flex justify-center">
          <Button
            disabled={isPending}
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
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <ClipboardCheck className="size-4" />
                Confirmar y completar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
