"use client";

import { useCreateCreditPayment } from "@/actions/aerolinea/pagos_creditos/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { cn } from "@/lib/utils";
import { Credit } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AmountInput } from "../../../misc/AmountInput";
import { useCompanyStore } from "@/stores/CompanyStore";

interface FormProps {
  onClose: () => void;
  credit: Credit;
}

export function CreditPaymentForm({ onClose, credit }: FormProps) {
  const { createCreditPayment } = useCreateCreditPayment();
  const { selectedCompany } = useCompanyStore();
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();
  // Calcular el monto pendiente por pagar
  const pendingAmount = Number(credit.debt) - Number(credit.payed_amount || 0);
  const formSchema = z
    .object({
      bank_account_id: z
        .string({
          message: "Debe elegir una cuenta de banco.",
        })
        .optional(),
      reference_cod: z.string().optional(),
      pay_method: z.enum(["EFECTIVO", "TRANSFERENCIA"], {
        message: "Debe elegir un método de pago.",
      }),
      pay_amount: z.string().refine(
        (val) => {
          const number = parseFloat(val);
          return !isNaN(number) && number > 0;
        },
        {
          message: "La cantidad pagada debe ser mayor a cero.",
        }
      ),
      payment_date: z.date({
        required_error: "La fecha de vuelo es requerida",
      }),
      pay_description: z
        .string()
        .min(3, {
          message: "Los detalles del pago deben tener al menos 3 caracteres.",
        })
        .max(100, {
          message: "Los detalles del pago tiene un máximo 100 caracteres.",
        }),
    })
    .refine(
      (data) => {
        if (data.pay_method === "TRANSFERENCIA" && !data.bank_account_id) {
          return false;
        }
        return true;
      },
      {
        message: "La cuenta de banco es requerida para transferencias.",
        path: ["bank_account_id"],
      }
    )
    .refine(
      (data) => {
        const payAmount = parseFloat(data.pay_amount);
        return payAmount <= pendingAmount;
      },
      {
        message: `El monto a pagar no puede ser mayor que el saldo pendiente (${pendingAmount.toFixed(2)})`,
        path: ["pay_amount"],
      }
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pay_amount: pendingAmount.toFixed(2),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payAmount = parseFloat(values.pay_amount);

    if (payAmount > pendingAmount) {
      form.setError("pay_amount", {
        message: `El monto a pagar no puede ser mayor que el saldo pendiente (${pendingAmount.toFixed(2)})`,
      });
      return;
    }

    const formattedValues = {
      ...values,
      id: credit.id,
      client_id: credit.client ? credit.client.id : null,
      pay_amount: payAmount,
      vendor_id: credit.vendor ? credit.vendor.id : null,
    };

    createCreditPayment.mutate(formattedValues, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Fecha de Pago</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1999-07-21")
                      }
                      initialFocus
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                      captionLayout="dropdown-buttons"
                      components={{
                        Dropdown: (props) => (
                          <select
                            {...props}
                            className="bg-popover text-popover-foreground"
                          >
                            {props.children}
                          </select>
                        ),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pay_method"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Método de Pago</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        {form.watch("pay_method") !== "EFECTIVO" && (
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Cuenta de Banco</FormLabel>
                  <Select
                    disabled={isAccLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isAccLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Seleccione el tipo..."
                            )
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts &&
                        accounts.map((acc) => (
                          <SelectItem value={acc.id.toString()} key={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference_cod"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Código de Referencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Código de referencia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="pay_amount"
          render={({ field }) => (
            <FormItem className="w-full">
              <div className="flex justify-between items-center">
                <FormLabel>Cantidad a Pagar</FormLabel>
                <span className="text-sm text-muted-foreground">
                  Saldo pendiente: {pendingAmount.toFixed(2)}
                </span>
              </div>
              <FormControl>
                <Input
                  placeholder={`Ingrese el monto a pagar (máximo ${pendingAmount.toFixed(2)})`}
                  {...field}
                  onChange={(e) => {
                    const value = e?.target.value;
                    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    form.setValue("pay_amount", pendingAmount.toFixed(2))
                  }
                >
                  Pagar deuda completo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("pay_amount", "0")}
                >
                  Limpiar
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pay_description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Detalle/Descripción" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createCreditPayment.isPending}>
          {createCreditPayment.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
