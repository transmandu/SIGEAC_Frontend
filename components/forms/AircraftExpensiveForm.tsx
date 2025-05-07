"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useGetCash } from "@/hooks/administracion/cajas/useGetCash";
import { useGetEmployeesByCompany } from "@/hooks/administracion/useGetEmployees";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetBankAccounts } from "@/hooks/ajustes/cuentas/useGetBankAccounts";
import { Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../ui/command";
import { useEffect } from "react";
import { useCashMovementForAircraft } from "@/actions/administracion/aeronaves/actions";

const formSchema = z.object({
  responsible_id: z.string({
    message: "Debe elegir un responsable.",
  }),
  cash_id: z.string({
    message: "Debe elegir una caja.",
  }),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  details: z
    .string()
    .min(2, {
      message:
        "El detalle de la sub categoría debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "El detalle de la sub categoría tiene un máximo 100 caracteres.",
    }),
  amount: z.string().refine(
    (val) => {
      // Convertir el valor a número y verificar que sea positivo
      const number = parseFloat(val);
      return !isNaN(number) && number > 0;
    },
    {
      message: "El monto debe ser mayor a cero.",
    }
  ),
  bank_account_id: z
    .union([
      z.string().min(1, { message: "Debe seleccionar una cuenta válida" }),
      z.null(),
    ])
    .refine((val) => val !== undefined, {
      message: "Debe seleccionar una opción",
    })
    .transform((val) => (val === "" ? null : val)), // Transforma "" a null
});

interface FormProps {
  onClose: () => void;
  id: string;
}

export function AircraftExpensiveForm({ id, onClose }: FormProps) {
  const { createCashMovementForAircraft } = useCashMovementForAircraft();
  const {
    data: employees,
    mutate,
    isPending: isEmployeesLoading,
  } = useGetEmployeesByCompany();
  const { data: cashes, isLoading: isCashesLoading } = useGetCash();
  const { data: bankaccounts, isLoading: isBankAccLoading } =
    useGetBankAccounts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    mutate("transmandu");
    // Observar cambios en la caja seleccionada
    const subscription = form.watch((value, { name }) => {
      if (name === "cash_id") {
        // Encontrar la caja seleccionada
        const selectedCash = cashes?.find(
          (cash) => cash.id.toString() === value.cash_id
        );
        // Si es de tipo efectivo, resetear el campo de cuenta bancaria
        if (selectedCash?.type === "EFECTIVO") {
          form.setValue("bank_account_id", null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [mutate, form, cashes]);

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    createCashMovementForAircraft.mutate({ id, formData }, {  
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
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Fecha</FormLabel>
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1999-07-21")
                      }
                      initialFocus
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
                      captionLayout="dropdown-buttons" // Selectores de año/mes
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
            name="cash_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Caja</FormLabel>
                <Select
                  disabled={isCashesLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la caja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cashes &&
                      cashes.map((cash) => (
                        <SelectItem key={cash.id} value={cash.id.toString()}>
                          {cash.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Monto Final</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese monto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/*Validacion para cuando la caja sea efectivo retorna nulo y cuando la caja sea tipo transferencia mostrara la cuenta de banco*/}
        {(() => {
          const selectedCashId = form.watch("cash_id");
          const selectedCash = cashes?.find(
            (cash) => cash.id.toString() === selectedCashId
          );
          if (selectedCash?.type === "EFECTIVO") {
            return null;
          }
          return (
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Cuenta de Banco</FormLabel>
                  <Select
                    disabled={isBankAccLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value === null ? "" : field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isBankAccLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Seleccione una cuenta..."
                            )
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankaccounts &&
                        bankaccounts.map((acc) => (
                          <SelectItem value={acc.id.toString()} key={acc.id}>
                            {acc.name} - {acc.bank.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })()}
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Detalles</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese los detalles" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 items-center ">
          <div className="flex-1 min-w-[200px]">
            <FormField
              control={form.control}
              name="responsible_id"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                  <FormLabel>Responsable</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isEmployeesLoading}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isEmployeesLoading && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          {field.value ? (
                            <p>
                              {
                                employees?.find(
                                  (employee) =>
                                    employee.id.toString() === field.value
                                )?.first_name
                              }{" "}
                              {
                                employees?.find(
                                  (employee) =>
                                    employee.id.toString() === field.value
                                )?.last_name
                              }
                            </p>
                          ) : (
                            "Elige al responsable..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Busque un responsable..." />
                        <CommandList>
                          <CommandEmpty className="text-sm p-2 text-center">
                            No se ha encontrado ningún empleado.
                          </CommandEmpty>
                          <CommandGroup>
                            {employees?.map((employee) => (
                              <CommandItem
                                value={`${employee.first_name} ${employee.last_name}`}
                                key={employee.id}
                                onSelect={() => {
                                  form.setValue(
                                    "responsible_id",
                                    employee.id.toString()
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    `${employee.first_name} ${employee.last_name}` ===
                                      field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {
                                  <p>
                                    {employee.first_name} {employee.last_name}
                                  </p>
                                }
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={createCashMovementForAircraft.isPending}>
          {createCashMovementForAircraft.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
