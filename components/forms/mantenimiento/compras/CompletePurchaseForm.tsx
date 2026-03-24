"use client";

import { useCompletePurchase } from "@/actions/mantenimiento/compras/ordenes_compras/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useGetCards } from "@/hooks/general/tarjetas/useGetCards";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PurchaseOrder } from "@/types";
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
  payment_method: z.string(),
  bank_account_id: z.string(),
  card_id: z.string().optional(),
  ock_shipping: z.string(),
  usa_shipping: z.string(),
  invoice: z.instanceof(File).optional(),
  articles_purchase_orders: z.array(
    z.object({
      article_part_number: z.string(),
      article_purchase_order_id: z.number().optional(),
      usa_tracking: z.string(),
      ock_tracking: z.string(),
      article_location: z.string(),
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
  const { user } = useAuth();
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();
  const { data: cards, isLoading: isCardsLoading } = useGetCards();
  const { completePurchase } = useCompletePurchase();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tax: "",
      wire_fee: "",
      handling_fee: "",
      usa_shipping: "",
      ock_shipping: "",
      payment_method: "",
      articles_purchase_orders: po.article_purchase_order.map((article) => ({
        article_part_number: article.article_part_number,
        article_purchase_order_id: article.id,
        usa_tracking: "",
        ock_tracking: "",
        article_location: "",
      })),
    },
  });

  const { tax, wire_fee, handling_fee, usa_shipping, ock_shipping } = form.watch();
  const paymentMethod = form.watch("payment_method");

  const total = useMemo(() => {
    return (
      Number(po.sub_total) +
      Number(tax || 0) +
      Number(wire_fee || 0) +
      Number(handling_fee || 0) +
      Number(usa_shipping || 0) +
      Number(ock_shipping || 0)
    );
  }, [po.sub_total, tax, wire_fee, handling_fee, usa_shipping, ock_shipping]);

  const onSubmit = async (data: FormSchemaType) => {
    const computedTotal =
      Number(po.sub_total) +
      Number(data.tax || 0) +
      Number(data.wire_fee || 0) +
      Number(data.handling_fee || 0) +
      Number(data.usa_shipping || 0) +
      Number(data.ock_shipping || 0);

    const finalData = {
      ...data,
      articles_purchase_orders: data.articles_purchase_orders.map((article) => ({
        article_part_number: article.article_part_number,
        article_purchase_order_id: article.article_purchase_order_id!,
        article_location: article.article_location,
        usa_tracking: article.usa_tracking,
        ock_tracking: article.ock_tracking,
      })),
      company: selectedCompany!.slug,
      total: computedTotal,
      updated_by: `${user?.first_name} ${user?.last_name}`,
    };

    await completePurchase.mutateAsync({
      id: po.id,
      data: { ...finalData },
      company: selectedCompany!.slug,
    });
    onClose();
  };

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
              name="usa_shipping"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Envío USA
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
              name="ock_shipping"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Envío OCK21
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

        {/* ── Artículos — tracking y ubicación ──────────────────────── */}
        <div className="space-y-2">
          <SectionHeader>Tracking y ubicación</SectionHeader>

          {/* Cabecera de columnas */}
          <div className="grid grid-cols-[1fr_140px_140px_1fr] gap-3 px-3 pb-1 border-b border-border/60">
            {['Nro. Parte', 'Tracking USA', 'Tracking OCK', 'Ubicación'].map((h) => (
              <span key={h} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{h}</span>
            ))}
          </div>

          <ScrollArea className={cn(po.article_purchase_order.length >= 2 && "h-[220px]")}>
            <div className="space-y-0">
              {po.article_purchase_order.map((article, index) => (
                <div
                  key={article.id}
                  className="grid grid-cols-[1fr_140px_140px_1fr] gap-3 items-start px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* PN — read-only */}
                  <FormField
                    control={form.control}
                    name={`articles_purchase_orders.${index}.article_part_number`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            disabled
                            className="font-mono text-sm h-8 bg-muted/60 border-border/50 disabled:opacity-100 disabled:cursor-default tracking-wide"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Tracking USA */}
                  <FormField
                    control={form.control}
                    name={`articles_purchase_orders.${index}.usa_tracking`}
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

                  {/* Tracking OCK */}
                  <FormField
                    control={form.control}
                    name={`articles_purchase_orders.${index}.ock_tracking`}
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

                  {/* Ubicación */}
                  <FormField
                    control={form.control}
                    name={`articles_purchase_orders.${index}.article_location`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Miami, PZO, en tránsito..."
                            className="text-sm min-h-[32px] h-8 resize-none py-1.5"
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
          disabled={completePurchase.isPending}
          type="submit"
          className="w-full h-10"
        >
          {completePurchase.isPending ? (
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
