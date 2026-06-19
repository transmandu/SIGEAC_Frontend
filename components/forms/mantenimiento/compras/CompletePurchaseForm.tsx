"use client";

import { useCompletePurchase, useMarkPurchaseOrderAsPaid } from "@/actions/mantenimiento/compras/ordenes_compras/actions";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useGetCards } from "@/hooks/general/tarjetas/useGetCards";
import { useGetShippingAgencies } from "@/hooks/general/agencias_envio/useGetShippingAgencies";
import { cn } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/purchase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageCheck } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AmountInput } from "../../../misc/AmountInput";

const FormSchema = z.object({
  tax: z.string(),
  wire_fee: z.string(),
  handling_fee: z.string(),
  shipping_fee: z.string(),
  international_shipping: z.string(),
  payment_method: z.string(),
  bank_account_id: z.string(),
  card_id: z.string().optional(),
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

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
    {children}
  </p>
);

export function CompletePurchaseForm({ onClose, po }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();
  const { data: cards, isLoading: isCardsLoading } = useGetCards();
  const { data: shippingAgencies, isLoading: isAgenciesLoading } = useGetShippingAgencies(selectedCompany?.slug);
  const { completePurchase } = useCompletePurchase();
  const { markPurchaseOrderAsPaid } = useMarkPurchaseOrderAsPaid();

  const articleRows = useMemo(
    () => [
      ...po.article_purchase_order.map((article) => ({
        article_purchase_order_id: article.id,
        label: article.article_quote_order?.article_requisition_order?.article_part_number ?? `Artículo #${article.id}`,
      })),
      ...po.general_article_purchase_order.map((article) => ({
        article_purchase_order_id: article.id,
        label: article.general_article_quote_order?.general_article_requisition_order?.description ?? `Artículo #${article.id}`,
      })),
    ],
    [po.article_purchase_order, po.general_article_purchase_order]
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tax: "",
      wire_fee: "",
      handling_fee: "",
      shipping_fee: "",
      international_shipping: "",
      payment_method: "",
      bank_account_id: "",
      invoice_number: "",
      observation: "",
      articles_purchase_orders: articleRows.map((article) => ({
        article_purchase_order_id: article.article_purchase_order_id,
        label: article.label,
        shipping_tracking: "",
        international_shipping_tracking: "",
      })),
    },
  });

  const { tax, wire_fee, handling_fee, shipping_fee, international_shipping } = form.watch();
  const paymentMethod = form.watch("payment_method");

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
        shipping_fee: Number(data.shipping_fee || 0),
        international_shipping: Number(data.international_shipping || 0),
        total: computedTotal,
        bank_account_id: data.bank_account_id ? Number(data.bank_account_id) : null,
        card_id: data.card_id ? Number(data.card_id) : null,
        shipping_agency_id: data.shipping_agency_id ? Number(data.shipping_agency_id) : null,
        invoice_number: data.invoice_number || null,
        observation: data.observation || null,
        invoice: data.invoice,
        articles_purchase_orders: data.articles_purchase_orders.map((article) => ({
          article_purchase_order_id: article.article_purchase_order_id,
          shipping_tracking: article.shipping_tracking || null,
          international_shipping_tracking: article.international_shipping_tracking || null,
        })),
      },
      company: selectedCompany!.slug,
    });

    await markPurchaseOrderAsPaid.mutateAsync({
      id: po.id,
      company: selectedCompany!.slug,
    });

    onClose();
  };

  const isPending = completePurchase.isPending || markPurchaseOrderAsPaid.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 pt-1"
      >

        {/* ── Costos de importación ──────────────────────────────────── */}
        <div className="space-y-2">
          <SectionHeader>Costos de importación</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="tax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tax
                  </FormLabel>
                  <FormControl>
                    <AmountInput placeholder="$0.00" {...field} />
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
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Wire Fee
                  </FormLabel>
                  <FormControl>
                    <AmountInput placeholder="$0.00" {...field} />
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
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Handling Fee
                  </FormLabel>
                  <FormControl>
                    <AmountInput placeholder="$0.00" {...field} />
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
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Envío internacional
                  </FormLabel>
                  <FormControl>
                    <AmountInput placeholder="$0.00" {...field} />
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
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Envío nacional
                  </FormLabel>
                  <FormControl>
                    <AmountInput placeholder="$0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resumen de total */}
            <div className="flex flex-col justify-end">
              <div className="p-2 rounded-lg border border-border/60 bg-muted/20 space-y-0.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">${Number(po.sub_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border/40 pt-0.5 mt-0.5">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Agencia de envío ────────────────────────────────────────── */}
        <div className="space-y-2">
          <SectionHeader>Envío</SectionHeader>
          <FormField
            control={form.control}
            name="shipping_agency_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Agencia de envío
                </FormLabel>
                <Select disabled={isAgenciesLoading} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
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

        {/* ── Artículos — tracking ─────────────────────────────────────── */}
        <div className="space-y-2">
          <SectionHeader>Tracking de envío</SectionHeader>

          {/* Cabecera de columnas */}
          <div className="grid grid-cols-[1fr_140px_140px] gap-3 px-3 pb-1 border-b border-border/60">
            {['Artículo', 'Tracking nacional', "Tracking int'l"].map((h) => (
              <span key={h} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{h}</span>
            ))}
          </div>

          <ScrollArea className={cn(articleRows.length >= 2 && "h-[220px]")}>
            <div className="space-y-0">
              {articleRows.map((article, index) => (
                <div
                  key={article.article_purchase_order_id}
                  className="grid grid-cols-[1fr_140px_140px] gap-3 items-start px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Identidad — read-only */}
                  <div className="flex items-center h-8">
                    <span className="font-mono text-sm truncate">{article.label}</span>
                  </div>

                  {/* Tracking nacional */}
                  <FormField
                    control={form.control}
                    name={`articles_purchase_orders.${index}.shipping_tracking`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Tracking #"
                            className="font-mono text-sm h-8"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tracking internacional */}
                  <FormField
                    control={form.control}
                    name={`articles_purchase_orders.${index}.international_shipping_tracking`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Tracking #"
                            className="font-mono text-sm h-8"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Pago ────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <SectionHeader>Pago</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            {/* Método de pago */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Método
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
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
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Cuenta bancaria
                    </FormLabel>
                    <Select disabled={isAccLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
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
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tarjeta
                    </FormLabel>
                    <Select disabled={isCardsLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
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

            {/* Nro. de factura */}
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nro. Factura
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="INV-0001"
                      className="h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice */}
            <FormField
              control={form.control}
              name="invoice"
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Invoice
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="cursor-pointer h-9 text-sm"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? undefined;
                        onChange(file);
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <Button
          disabled={isPending}
          type="submit"
          className="w-full h-10"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <PackageCheck className="size-4 mr-2" />
              Confirmar compra
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
