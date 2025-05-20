"use client"

import { useCompletePurchase } from "@/actions/compras/ordenes_compras/actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useGetBankAccounts } from "@/hooks/ajustes/cuentas/useGetBankAccounts"
import { useGetCards } from "@/hooks/ajustes/tarjetas/useGetCards"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { PurchaseOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AmountInput } from "../misc/AmountInput"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Textarea } from "../ui/textarea"

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
  articles_purchase_orders: z.array(z.object({
    article_part_number: z.string(),
    article_purchase_order_id: z.number().optional(),
    usa_tracking: z.string(),
    ock_tracking: z.string(),
    article_location: z.string(),
  }))
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void
  po: PurchaseOrder,
}

export function CompletePurchaseForm({ onClose, po }: FormProps) {

  const { user } = useAuth()

  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts()

  const { data: cards, isLoading: isCardsLoading } = useGetCards()

  const { selectedCompany } = useCompanyStore()

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
      articles_purchase_orders: po.article_purchase_order.map(article => ({
        article_part_number: article.article_part_number,
        article_purchase_order_id: article.id,
        usa_tracking: "", // Inicializando campos para evitar errores
        ock_tracking: "",
      })),
    },
  });

  const total = useMemo(() => {
    return (
      Number(po.sub_total) +
      Number(form.watch("tax") || 0) +
      Number(form.watch("wire_fee") || 0) +
      Number(form.watch("handling_fee") || 0) +
      Number(form.watch("usa_shipping") || 0) +
      Number(form.watch("ock_shipping") || 0)
    );
  }, [
    po.sub_total,
    form.watch("tax"),
    form.watch("wire_fee"),
    form.watch("handling_fee"),
    form.watch("usa_shipping"),
    form.watch("ock_shipping"),
  ]);

  const onSubmit = async (data: FormSchemaType) => {

    const total =
      Number(po.sub_total) +
      Number(data.tax || 0) +
      Number(data.wire_fee || 0) +
      Number(data.handling_fee || 0) +
      Number(data.usa_shipping || 0) +
      Number(data.ock_shipping || 0);

    const finalData = {
      ...data,
      articles_purchase_orders: data.articles_purchase_orders.map(article => ({
        article_part_number: article.article_part_number,
        article_purchase_order_id: article.article_purchase_order_id!,
        article_location: article.article_location,
        usa_tracking: article.usa_tracking,
        ock_tracking: article.ock_tracking,
      })),
      company: selectedCompany!.replace(/\s/g, "").toLowerCase(),
      total,
      updated_by: `${user?.first_name} ${user?.last_name}`
    };

    await completePurchase.mutateAsync({ id: po.id, data: { ...finalData } })

    onClose()

  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3 w-full">
        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax</FormLabel>
                <FormControl>
                  <AmountInput placeholder="$0.00 " {...field} />
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
                <FormLabel>Tarifa Bancaria</FormLabel>
                <FormControl>
                  <AmountInput placeholder="$0.00 " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="handling_fee"
            render={({ field }) => (
              <FormItem className="col-span-2 lg:col-span-1">
                <FormLabel>Fee de Manejo</FormLabel>
                <FormControl>
                  <AmountInput placeholder="$0.00 " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-3 justify-center items-center">
          <FormField
            control={form.control}
            name="usa_shipping"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-center">Envío - USA</FormLabel>
                <FormControl>
                  <AmountInput placeholder="$0.00 " {...field} />
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
                <FormLabel className="flex justify-center">Envío - OCK21</FormLabel>
                <FormControl>
                  <AmountInput placeholder="$0.00 " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-1 text-sm">
          <p>Subtotal: <span className="font-medium">${Number(po.sub_total).toFixed(2)}</span></p>
          <p>Total <span className="italic">(+ impuestos)</span> : <span className="font-medium">${Number(total).toFixed(2)}</span></p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Artículos de la Orden</h3>
          <ScrollArea className={cn("", po.article_purchase_order.length >= 2 ? "h-[250px]" : "")}>
            {po.article_purchase_order.map((article, index) => (
              <>
                <div key={article.id} className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name={`articles_purchase_orders.${index}.article_part_number`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parte</FormLabel>
                      <FormControl>
                        <Input defaultValue={article.article_part_number} className="input disabled:opacity-80" {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`articles_purchase_orders.${index}.usa_tracking`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking - USA</FormLabel>
                      <FormControl>
                        <Input className="input" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`articles_purchase_orders.${index}.ock_tracking`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking - OCK21</FormLabel>
                      <FormControl>
                        <Input className="input" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`articles_purchase_orders.${index}.article_location`} render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Ubicación Actual</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Miami, PZO, etc..." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                <Separator className="my-3" />
              </>
            ))}
          </ScrollArea>
        </div>
        <div className="grid grid-cols-2 gap-2 items-center">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Método de Pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el método..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="transferencia_usa">Transferencia - USA</SelectItem>
                    <SelectItem value="transferencia_nacional">Transferencia - Nacional</SelectItem>
                    <SelectItem value="debito_credito">Debito / Credito</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            (form.watch("payment_method") === 'transferencia_nacional' || form.watch("payment_method") === 'transferencia_usa') && (
              <FormField
                control={form.control}
                name="bank_account_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cuenta Bancaria</FormLabel>
                    <Select disabled={isAccLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el método..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                          accounts && accounts.map((acc) => (
                            <SelectItem value={acc.id.toString()} key={acc.id}>{acc.name} ({acc.account_number}) - {acc.bank.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }
          {
            (form.watch("payment_method") === 'debito_credito') && (
              <FormField
                control={form.control}
                name="card_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Tarjeta Bancaria</FormLabel>
                    <Select disabled={isCardsLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el método..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                          cards && cards.map((card) => (
                            <SelectItem value={card.id.toString()} onClick={() => {
                              form.setValue("bank_account_id", card.bank_account.id.toString())
                            }} key={card.id}>{card.name} ({card.card_number}) - {card.bank_account.bank.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          }
          <FormField
            control={form.control}
            name="invoice"
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormItem className="w-full">
                <FormLabel>Invoice</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
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
        <Button disabled={completePurchase.isPending}>
          {completePurchase.isPending ? <Loader2 className="animate-spin size-4" /> : "Confirmar Compra"}
        </Button>
      </form>
    </Form>
  )
}
