"use client";

import { useCompletePurchase, useMarkPurchaseOrderAsCompleted } from "@/actions/mantenimiento/compras/ordenes_compras/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useGetCards } from "@/hooks/general/tarjetas/useGetCards";
import { useGetShippingAgencies } from "@/hooks/general/agencias_envio/useGetShippingAgencies";
import { cn } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/purchase";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, FileCheck2, Loader2, Paperclip, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
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
  payment_method: z.string(),
  bank_account_id: z.string(),
  card_id: z.string().optional(),
  knows_shipping_info: z.boolean(),
  shipping_agency_id: z.string().optional(),
  invoice_number: z.string().optional(),
  observation: z.string().optional(),
  invoice: z.instanceof(File).optional(),
  articles_purchase_orders: z.array(
    z.object({
      article_purchase_order_id: z.number(),
      label: z.string(),
      shipping_tracking: z.string(),
      international_shipping_tracking: z.string(),
    })
  ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  po: PurchaseOrder;
}

/** El método de pago no se persiste — se reconstruye a partir de qué medio quedó asociado a la orden, para que el campo no aparezca vacío al revisar. */
const inferPaymentMethod = (po: PurchaseOrder): string => {
  if (po.card) return "debito_credito";
  if (po.bank_account) return "transferencia_nacional";
  return "";
};

export function CompleteOrderForm({ onClose, po }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();
  const { data: cards, isLoading: isCardsLoading } = useGetCards();
  const { data: shippingAgencies, isLoading: isAgenciesLoading } = useGetShippingAgencies(selectedCompany?.slug);
  const { completePurchase } = useCompletePurchase();
  const { markPurchaseOrderAsCompleted } = useMarkPurchaseOrderAsCompleted();

  const articleRows = useMemo(
    () => [
      ...po.article_purchase_order.map((article) => {
        const quote = article.article_quote_order;
        const quantity = Number(quote?.quantity ?? 0);
        const unitPrice = Number(quote?.unit_price ?? 0);
        return {
          article_purchase_order_id: article.id,
          label: quote?.article_requisition_order?.article_part_number ?? `Artículo #${article.id}`,
          batchName: article.batch?.name ?? null,
          batchCategory: article.batch?.category ?? null,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
          unitLabel: article.unit?.label ?? null,
          shipping_tracking: article.shipping_tracking ?? "",
          international_shipping_tracking: article.international_shipping_tracking ?? "",
        };
      }),
      ...po.general_article_purchase_order.map((article) => {
        const quote = article.general_article_quote_order;
        const quantity = Number(quote?.quantity ?? 0);
        const unitPrice = Number(quote?.unit_price ?? 0);
        return {
          article_purchase_order_id: article.id,
          label: quote?.general_article_requisition_order?.description ?? `Artículo #${article.id}`,
          batchName: null,
          batchCategory: null,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
          unitLabel: null,
          shipping_tracking: article.shipping_tracking ?? "",
          international_shipping_tracking: article.international_shipping_tracking ?? "",
        };
      }),
    ],
    [po.article_purchase_order, po.general_article_purchase_order]
  );

  const hadShippingInfo = !!(po.shipping_agency || po.shipping_fee || po.international_shipping);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tax: po.tax != null ? String(po.tax) : "",
      wire_fee: po.wire_fee != null ? String(po.wire_fee) : "",
      handling_fee: po.handling_fee != null ? String(po.handling_fee) : "",
      shipping_fee: po.shipping_fee != null ? String(po.shipping_fee) : "",
      international_shipping: po.international_shipping != null ? String(po.international_shipping) : "",
      payment_method: inferPaymentMethod(po),
      bank_account_id: po.bank_account ? String(po.bank_account.id) : "",
      card_id: po.card ? String(po.card.id) : "",
      knows_shipping_info: hadShippingInfo,
      shipping_agency_id: po.shipping_agency ? String(po.shipping_agency.id) : "",
      invoice_number: po.invoice_number ?? "",
      observation: po.observation ?? "",
      articles_purchase_orders: articleRows.map((article) => ({
        article_purchase_order_id: article.article_purchase_order_id,
        label: article.label,
        shipping_tracking: article.shipping_tracking,
        international_shipping_tracking: article.international_shipping_tracking,
      })),
    },
  });

  const { tax, wire_fee, handling_fee, shipping_fee, international_shipping } = form.watch();
  const paymentMethod = form.watch("payment_method");
  const knowsShippingInfo = form.watch("knows_shipping_info");

  const total = useMemo(() => {
    return (
      Number(po.sub_total) +
      Number(tax || 0) +
      Number(wire_fee || 0) +
      Number(handling_fee || 0) +
      Number(shipping_fee || 0) +
      Number(international_shipping || 0)
    );
  }, [po.sub_total, tax, wire_fee, handling_fee, shipping_fee, international_shipping]);

  const onSubmit = async (data: FormSchemaType) => {
    const computedTotal =
      Number(po.sub_total) +
      Number(data.tax || 0) +
      Number(data.wire_fee || 0) +
      Number(data.handling_fee || 0) +
      Number(data.shipping_fee || 0) +
      Number(data.international_shipping || 0);

    await completePurchase.mutateAsync({
      id: po.id,
      data: {
        tax: Number(data.tax || 0),
        wire_fee: Number(data.wire_fee || 0),
        handling_fee: Number(data.handling_fee || 0),
        shipping_fee: data.knows_shipping_info ? Number(data.shipping_fee || 0) : 0,
        international_shipping: data.knows_shipping_info ? Number(data.international_shipping || 0) : 0,
        total: computedTotal,
        bank_account_id: data.bank_account_id ? Number(data.bank_account_id) : null,
        card_id: data.card_id ? Number(data.card_id) : null,
        shipping_agency_id: data.knows_shipping_info && data.shipping_agency_id ? Number(data.shipping_agency_id) : null,
        invoice_number: data.invoice_number || null,
        observation: data.observation || null,
        invoice: data.invoice,
        articles_purchase_orders: data.articles_purchase_orders.map((article) => ({
          article_purchase_order_id: article.article_purchase_order_id,
          shipping_tracking: data.knows_shipping_info ? article.shipping_tracking || null : null,
          international_shipping_tracking: data.knows_shipping_info ? article.international_shipping_tracking || null : null,
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

        {/* ── Toggle: datos de envío conocidos ──────────────────────────── */}
        <FormField
          control={form.control}
          name="knows_shipping_info"
          render={({ field }) => (
            <FormItem
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                field.value
                  ? "border-teal-500/20 bg-teal-500/[0.04]"
                  : "border-border/40 bg-muted/10"
              )}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-3.5"
                />
              </FormControl>
              <Truck className={cn("size-3.5", field.value ? "text-teal-600" : "text-muted-foreground/60")} />
              <FormLabel className="!mt-0 text-xs font-medium cursor-pointer select-none text-foreground/90">
                Ya conozco los datos de envío
              </FormLabel>
              <span className="text-[11px] text-muted-foreground/70 select-none">
                — agencia, costos y tracking por artículo
              </span>
            </FormItem>
          )}
        />

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
                  <div className="relative px-3 py-2.5 pr-24">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-0.5">
                      <span className={LABEL_CLS}>Total</span>
                      <span className="font-semibold tabular-nums leading-none">
                        ${article.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-x-3 gap-y-2.5">
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
                        <span className="text-sm tabular-nums">
                          {article.quantity}{article.unitLabel ? ` ${article.unitLabel}` : ""}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className={LABEL_CLS}>Precio unitario</span>
                        <span className="text-sm tabular-nums">${article.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {knowsShippingInfo && (
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
                    )}
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

              {knowsShippingInfo && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Pago */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground select-none">
              Pago
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Método de pago */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL_CLS}>Método</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={SELECT_TRIGGER_CLS}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="transferencia_usa">Transferencia — USA</SelectItem>
                        <SelectItem value="transferencia_nacional">Transferencia — Nacional</SelectItem>
                        <SelectItem value="debito_credito">Débito / Crédito</SelectItem>
                        <SelectItem value="zelle">Zelle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cuenta bancaria */}
              {(paymentMethod === "transferencia_nacional" || paymentMethod === "transferencia_usa") && (
                <FormField
                  control={form.control}
                  name="bank_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={LABEL_CLS}>Cuenta bancaria</FormLabel>
                      <Select disabled={isAccLoading} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={SELECT_TRIGGER_CLS}>
                            <SelectValue placeholder="Seleccionar cuenta..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map((acc) => (
                            <SelectItem value={acc.id.toString()} key={acc.id} className="text-sm">
                              {acc.name} ({acc.account_number}) — {acc.bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Tarjeta */}
              {paymentMethod === "debito_credito" && (
                <FormField
                  control={form.control}
                  name="card_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={LABEL_CLS}>Tarjeta</FormLabel>
                      <Select disabled={isCardsLoading} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={SELECT_TRIGGER_CLS}>
                            <SelectValue placeholder="Seleccionar tarjeta..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cards?.map((card) => (
                            <SelectItem
                              value={card.id.toString()}
                              key={card.id}
                              className="text-sm"
                              onClick={() => {
                                form.setValue("bank_account_id", card.bank_account.id.toString());
                              }}
                            >
                              {card.name} ({card.card_number}) — {card.bank_account.bank.name}
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
                Subtotal ${Number(po.sub_total).toFixed(2)}
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
