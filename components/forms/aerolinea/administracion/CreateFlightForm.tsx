"use client";

import { useCreateFlight } from "@/actions/aerolinea/vuelos/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../../../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AmountInput } from "../../../misc/AmountInput";
import { useGetRoute } from "@/hooks/aerolinea/rutas/useGetRoutes";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { Label } from "../../../ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/stores/CompanyStore";

const formSchema = z
  .object({
    client_id: z.string({
      message: "Debe elegir un cliente.",
    }),
    route_id: z.string({
      message: "Debe elegir una ruta.",
    }),
    aircraft_id: z.string({
      message: "Debe elegir un avión.",
    }),
    date: z.date({
      required_error: "La fecha de vuelo es requerida",
    }),
    reference_cod: z.string().optional(),
    guide_code: z
      .string()
      .min(1, {
        message: "El número de vuelo es requerido.",
      })
      .max(10, {
        message: "El número de guía tiene un máximo de 10 caracteres.",
      }),
    fee: z
      .string()
      .min(1, "La tarifa es requerida")
      .refine(
        (val) => {
          const number = parseFloat(val);
          return !isNaN(number) && number >= 0;
        },
        {
          message: "La tarifa debe ser mayor a cero.",
        }
      )
      .optional(), // Hacer que la tarifa sea opcional
    type: z.enum(["CARGA", "PAX", "CHART"], {
      message: "Debe elegir un tipo de vuelo.",
    }),
    bank_account_id: z.string().optional(),
    debt_status: z.enum(["PENDIENTE", "PAGADO"], {
      message: "Debe elegir un estado de vuelo.",
    }),
    pay_method: z.enum(["EFECTIVO", "TRANSFERENCIA"], {
      message: "Debe elegir un método de pago.",
    }),
    total_amount: z
      .string()
      .min(1, "El monto total es requerido")
      .refine((value) => parseFloat(value) >= 0, {
        message: "El monto total debe ser mayor que cero",
      }),
    payed_amount: z
      .string()
      .min(1, "El monto pagado es requerido")
      .refine((value) => parseFloat(value) >= 0, {
        message: "El monto pagado no puede ser negativo",
      }),
  })
  .refine(
    (data) => {
      const totalAmount = parseFloat(data.total_amount);
      const payedAmount = parseFloat(data.payed_amount);
      return payedAmount <= totalAmount;
    },
    {
      message: "El monto pagado no puede ser mayor que el precio a cobrar",
      path: ["payed_amount"], // Esto indica que el error se mostrará en el campo payed_amount
    }
  );
interface FormProps {
  onClose: () => void;
}

export function FlightForm({ onClose }: FormProps) {
  const { createFlight } = useCreateFlight();
  const {selectedCompany} = useCompanyStore();
  const { data: routes, isLoading: isRouteLoading, isError } = useGetRoute();
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts(
    selectedCompany?.slug
  );
  const [kg, setKg] = useState("0");
  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClients(selectedCompany?.slug);
  const {
    data: aircrafts,
    isLoading: isAircraftLoading,
    isError: isAircraftError,
  } = useGetAircrafts(selectedCompany?.slug);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total_amount: "0",
      payed_amount: "0",
      fee: "0",
    },
  });

  useEffect(() => {
    const total = Number(form.watch("total_amount"));
    const payed = Number(form.watch("payed_amount"));
    if (payed > total) {
      form.setValue("payed_amount", total.toString());
    }
  }, [form]);


  const {fee, type} = form.watch();

  useEffect(() => {
    if (type !== "CHART") {
      let newAmount = 0;
      const feeString = fee || "0";
      const final_fee = parseFloat(feeString.replace(/,/g, "")); // Asegurar reemplazo de comas

      // Asegurar que kg use punto como separador decimal
      const kgValue = parseFloat(kg.replace(/,/g, "") || "0");

      if (!isNaN(kgValue)) {
        newAmount = kgValue * final_fee;
      }

      form.setValue("total_amount", newAmount.toFixed(2).toString());
    }
  }, [kg, fee, type, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      ...values,
      fee: values.type === "CHART" ? "0": values.fee,
      details: values.type === "CARGA" ? `${kg} KG` : values.type === "PAX" ? `${kg} Pasajeros` : "Vuelo Charter",
    };
    createFlight.mutate(formattedValues, {
      onSuccess: () => {
        onClose(); // Cierra el modal solo si la creación fue exitosa
      },
    });
  }

  const debtStatus = form.watch("debt_status");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="guide_code"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Número de Guía</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={4}
                    value={field.value?.replace(/-/g, '') || ''}
                    onChange={(value) => {
                      // Formatea como XX-XX cuando se completan los 4 dígitos
                      const formattedValue = value.length === 4
                        ? `${value.slice(0, 2)}-${value.slice(2)}`
                        : value
                      field.onChange(formattedValue)
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                      <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Selec. una fecha</span>
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
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cliente</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isClientsLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isClientsLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value
                          ? clients?.find(
                              (client) => client.id.toString() === field.value
                            )?.name
                          : "Seleccione un cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Busque un cliente..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          No se ha encontrado ningún cliente.
                        </CommandEmpty>
                        <CommandGroup>
                          {clients?.map((client) => (
                            <CommandItem
                              value={client.name}
                              key={client.id}
                              onSelect={() => {
                                form.setValue(
                                  "client_id",
                                  client.id.toString()
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  client.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {client.name}
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
<FormField
            control={form.control}
            name="aircraft_id"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full space-y-3 mt-1">
                <FormLabel>Aeronave</FormLabel>
                <Select
                  disabled={isAircraftLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selec. la aeronave" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aircrafts &&
                      aircrafts
                        .filter(
                          (aircraft) => aircraft.status === "EN POSESION"
                        )
                        .map((aircraft) => (
                          <SelectItem
                            key={aircraft.id}
                            value={aircraft.id.toString()}
                          >
                            {aircraft.brand} - {aircraft.acronym}
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
            name="route_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Ruta</FormLabel>
                <Select
                  disabled={isRouteLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una ruta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {routes &&
                      routes.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.from} - {route.to}
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
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de vuelo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de vuelo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CARGA">Carga</SelectItem>
                    <SelectItem value="PAX">Pasajeros</SelectItem>
                    <SelectItem value="CHART">Reserva Privada</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
        {form.watch("type") !== "CHART" && (
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem className="w-1/3">
                  <FormLabel>Tarifa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {(form.watch("type") === "CARGA" || form.watch("type") === "PAX") && (
            <div className="space-y-2 w-1/3">
              <Label>
                {form.watch("type") === "CARGA" ? "KG" : " # Pasajeros"}
              </Label>
              <Input
                defaultValue={"0"}
                onChange={(e) => {
                  // Validar que solo se ingresen números y puntos
                  const value = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                    setKg(value);
                  }
                }}
                value={kg}
                placeholder={
                  form.watch("type") === "CARGA" ? "KG" : "# Pasajeros"
                }
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem className={cn("", form.watch("type") === "CHART" ? "w-full" : "w-1/3")}>
                <FormLabel>Precio a Cobrar</FormLabel>
                <FormControl>
                  <AmountInput
                    disabled={
                      form.watch("type") === "CARGA" ||
                      form.watch("type") === "PAX"
                    } // Deshabilitar si es CARGA o PAX
                    defaultValue="0"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger("payed_amount");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="debt_status"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de uso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="PAGADO">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {debtStatus !== "PAGADO" && (
            <FormField
              control={form.control}
              name="payed_amount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Monto Pagado</FormLabel>
                  <FormControl>
                    <AmountInput
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger("payed_amount");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="pay_method"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Método de Pago</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de vuelo" />
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

{form.watch("pay_method") && form.watch("pay_method") !== "EFECTIVO" && (
            <FormField
            control={form.control}
            name="bank_account_id"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                <FormLabel>Cuenta de Banco</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isAccLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isAccLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin mr-2" />
                            Cargando cuentas...
                          </>
                        ) : field.value ? (
                          accounts?.find(
                            (acc) => acc.id.toString() === field.value
                          ) ? (
                            `${accounts.find(
                              (acc) => acc.id.toString() === field.value
                            )?.name} - ${
                              accounts.find(
                                (acc) => acc.id.toString() === field.value
                              )?.bank.name
                            }`
                          ) : (
                            "Cuenta no encontrada"
                          )
                        ) : (
                          "Seleccione una cuenta..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                    <Command>
                      <CommandInput placeholder="Busque una cuenta bancaria..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          No se encontraron cuentas bancarias.
                        </CommandEmpty>
                        <CommandGroup>
                          {accounts?.map((acc) => (
                            <CommandItem
                              value={`${acc.name} ${acc.bank.name}`}
                              key={acc.id}
                              onSelect={() => {
                                form.setValue(
                                  "bank_account_id",
                                  acc.id.toString()
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  acc.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {acc.name} - {acc.bank.name}
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
          )}
        {
            form.watch("pay_method") === "TRANSFERENCIA" && (
              <FormField
                control={form.control}
                name="reference_cod"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Código de Referencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Código de referencia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
        }
        </div>
        <Button type="submit" disabled={createFlight.isPending}>
          {createFlight.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
