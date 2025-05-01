"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
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
import { useGetAircrafts } from "@/hooks/administracion/useGetAircrafts";
import { useGetClients } from "@/hooks/administracion/clientes/useGetClients";
import { useGetAdministrationArticle } from "@/hooks/administracion/useGetAdministrationArticle";
import { Calendar } from "../ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRenting } from "@/actions/administracion/arrendamiento/actions";
import { useGetBankAccounts } from "@/hooks/ajustes/cuentas/useGetBankAccounts";

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
    type: z.enum(["AERONAVE", "ARTICULO"]),
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
      .optional(),
    article_id: z
      .string({
        message: "Debe elegir un articulo.",
      })
      .optional(),
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
  .refine(data => data.deadline >= data.start_date, {
    message: "La fecha límite no puede ser anterior a la fecha de inicio",
    path: ["deadline"],
  });

interface FormProps {
  onClose: () => void;
}

export function CreateRentingForm({ onClose }: FormProps) {
  const { createRenting } = useCreateRenting();
  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClients();
  const {
    data: aircrafts,
    isLoading: isAircraftLoading,
    isError: isAircraftError,
  } = useGetAircrafts();
  const {
    data: articles,
    isLoading: isArticlesLoading,
    isError: isArticlesError,
  } = useGetAdministrationArticle();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
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
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AERONAVE">Aeronave</SelectItem>
                    <SelectItem value="ARTICULO">Artículo</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Mostrar solo cuando hay un tipo seleccionado */}
          {form.watch("type") && (
            <>
              {form.watch("type") !== "ARTICULO" && (
                <FormField
                  control={form.control}
                  name="aircraft_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3">
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
              )}
              {form.watch("type") !== "AERONAVE" && (
                <FormField
                  control={form.control}
                  name="article_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3 w-full">
                      <FormLabel>Artículo</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                <p>
                                  {
                                    articles?.find(
                                      (article) =>
                                        article.id.toString() === field.value
                                    )?.serial
                                  }{" "}
                                  -{" "}
                                  {
                                    articles?.find(
                                      (article) =>
                                        article.id.toString() === field.value
                                    )?.name
                                  }
                                </p>
                              ) : (
                                "Seleccione un artículo..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Busque un artículo..." />
                            <CommandList>
                              <CommandEmpty className="text-sm p-2 text-center">
                                No se ha encontrado ningún artículo.
                              </CommandEmpty>
                              <CommandGroup>
                                {articles
                                  ?.filter(
                                    (article) =>
                                      article.status === "EN POSESION"
                                  )
                                  ?.map((article) => (
                                    <CommandItem
                                      value={`${article.serial} ${article.name}`}
                                      key={article.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "article_id",
                                          article.id.toString()
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          article.id.toString() === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <p>
                                        {article.serial} - {article.name}
                                      </p>
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
            </>
          )}
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el precio" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
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
                  <Input placeholder="Ingrese el monto" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
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
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col space-y-3">
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
          )}
        </div>
        <div className="flex gap-2 items-center justify-center">
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
        </div>
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
