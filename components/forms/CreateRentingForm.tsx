"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { Calendar } from "../ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRenting } from "@/actions/aerolinea/arrendamiento/actions";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Fira_Mono } from "next/font/google";

const formSchema = z
  .object({
    description: z
      .string()
      .min(2, {
        message: "La descripción debe tener al menos 2 caracteres.",
      })
      .max(100, {
        message: "La descripción tiene un máximo 100 caracteres.",
      }),
    type: z.string(),
    reference_cod: z.string().optional(),
    price: z.string().refine(
      (val) => {
        const number = parseFloat(val);
        return !isNaN(number) && number > 0;
      },
      {
        message: "El monto debe ser mayor a cero.",
      }
    ),
    payed_amount: z.string().refine(
      (val) => {
        const number = parseFloat(val);
        return !isNaN(number) && number >= 0;
      },
      {
        message: "El monto debe ser un número válido.",
      }
    ),
    bank_account_id: z.string().optional(),
    pay_method: z.enum(["EFECTIVO", "TRANSFERENCIA"], {
      message: "Debe elegir un método de pago.",
    }),
    start_date: z.date({
      required_error: "La fecha de inicio es requerida",
    }),
    end_date: z
      .date({
        required_error: "La fecha final es requerida",
      })
      .optional(),
    deadline: z.date({
      required_error: "La fecha límite es requerida",
    }),
    //reference_pick: z.string(),
    client_id: z.string({
      message: "Debe elegir un cliente.",
    }),
    aircraft_id: z
      .string({
        message: "Debe elegir una aeronave.",
      })
  })
  .refine(
    (data) => {
      const price = parseFloat(data.price);
      const payedAmount = parseFloat(data.payed_amount);
      return payedAmount <= price;
    },
    {
      message: "El monto pagado no puede ser mayor que el precio total",
      path: ["payed_amount"],
    }
  )
  .refine((data) => data.deadline >= data.start_date, {
    message: "La fecha límite no puede ser anterior a la fecha de inicio",
    path: ["deadline"],
  });

interface FormProps {
  onClose: () => void;
}

export function CreateRentingForm({ onClose }: FormProps) {
  const {selectedCompany} = useCompanyStore();
  const { createRenting } = useCreateRenting();
  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClients(selectedCompany?.split(" ").join(""));
  const {
    data: aircrafts,
    isLoading: isAircraftLoading,
    isError: isAircraftError,
  } = useGetAircrafts(selectedCompany?.split(" ").join(""));
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "AERONAVE"
    },
  });
  const { data: accounts, isLoading: isAccLoading } = useGetBankAccounts();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createRenting.mutate(values, {
      onSuccess: () => {
        onClose(); // Cierra el modal solo si la creación fue exitosa
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
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2 w-full">
                <FormLabel>Fecha Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-2 text-left font-normal", // Cambiado a w-full
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione</span>
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
                        date > new Date() || date < new Date("1980-01-01")
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
            name="deadline"
            render={({ field }) => {
              const startDate = form.watch("start_date");
              return (
                <FormItem className="flex flex-col gap-2 w-full">
                  <FormLabel>Fecha Límite</FormLabel>
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
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione</span>
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
                        disabled={(date) => {
                          if (!startDate) return false;
                          return date < startDate;
                        }}
                        initialFocus
                        fromYear={2000}
                        toYear={new Date().getFullYear() + 1}
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
              );
            }}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Input value={"AERONAVE"} disabled />
                  </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aircraft_id"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3 w-full mt-1">
                <FormLabel>Aeronave</FormLabel>
                <Select
                  disabled={isAircraftLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un Avión" />
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
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      $
                    </span>
                    <Input
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                      onChange={(e) => {
                        // Validar que solo se ingresen números y un punto decimal
                        const value = e.target.value;
                        const regex = /^(\d+)?([.]?\d{0,2})?$/;

                        if (value === "" || regex.test(value)) {
                          field.onChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        // Formatear el valor al salir del input
                        const value = e.target.value;
                        if (value) {
                          const number = parseFloat(value);
                          if (!isNaN(number)) {
                            field.onChange(number.toFixed(2));
                          }
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payed_amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Monto Pagado</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      $
                    </span>
                    <Input
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                      onChange={(e) => {
                        // Validar que solo se ingresen números y un punto decimal
                        const value = e.target.value;
                        const regex = /^(\d+)?([.]?\d{0,2})?$/;

                        if (value === "" || regex.test(value)) {
                          field.onChange(value);
                        }
                      }}
                      onBlur={(e) => {
                        // Formatear el valor al salir del input
                        const value = e.target.value;
                        if (value) {
                          const number = parseFloat(value);
                          if (!isNaN(number)) {
                            field.onChange(number.toFixed(2));
                          }
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="pay_method"
            render={({ field }) => (
              <FormItem className={cn("", form.getValues("pay_method") === "EFECTIVO" ? "col-span-2" : "col-span-1")}>
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
          {form.watch("pay_method") !== "EFECTIVO" && (
          <>
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
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3 col-span-2">
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
                              `${
                                accounts.find(
                                  (acc) => acc.id.toString() === field.value
                                )?.name
                              } - ${
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
          </>
          )}
        </div>
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col space-y-3">
              <FormLabel>Cliente</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={isClientsLoading}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
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
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese alguna descripción" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        {/*   <FormField
          control={form.control}
          name="reference_pick"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Referencia</FormLabel>
              <FormControl>
                <Input placeholder="Capture o num. ref" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />  */}
        <Button type="submit" disabled={createRenting.isPending}>
          {createRenting.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
