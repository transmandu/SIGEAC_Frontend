"use client";

import { useCreateCredit } from "@/actions/aerolinea/creditos/cuentas_por_pagar/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "../../../ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "../../../ui/command";
import { useCompanyStore } from "@/stores/CompanyStore";

const formSchema = z
  .object({
    details: z
      .string()
      .min(2, {
        message: "La descripción debe tener al menos 2 caracteres.",
      })
      .max(100, {
        message: "La descripción tiene un máximo 100 caracteres.",
      }),
    debt: z.string().refine(
      (val) => {
        const number = parseFloat(val);
        return !isNaN(number) && number >= 0;
      },
      {
        message: "El monto debe ser un número válido.",
      }
    ),
    opening_date: z.date({
      required_error: "La fecha de inicio es requerida",
    }),
    deadline: z.date({
      required_error: "La fecha límite es requerida",
    }),
    vendor_id: z.string({
      message: "Debe elegir un proveedor.",
    }),
  })
  .refine((data) => data.deadline >= data.opening_date, {
    message: "La fecha límite no puede ser anterior a la fecha de inicio",
    path: ["deadline"],
  });

interface FormProps {
  onClose: () => void;
}

export function CreateCreditForm({ onClose }: FormProps) {
  const {selectedCompany} = useCompanyStore();
  const { createCredit } = useCreateCredit();
  const { data: vendors, isLoading: isVendorLoading } = useGetVendors(selectedCompany?.slug);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createCredit.mutate({ ...values, type: "PAGAR" }, {
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
            name="opening_date"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2 w-full">
                <FormLabel>Fecha Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-2 text-left font-normal",
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
              const startDate = form.watch("opening_date");
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
          name="vendor_id"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col space-y-3">
              <FormLabel>Beneficiario</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={isVendorLoading}
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {isVendorLoading && (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      )}
                      {field.value
                        ? vendors?.find(
                            (vendor) => vendor.id.toString() === field.value
                          )?.name
                        : "Seleccione un beneficiario"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command>
                    <CommandInput placeholder="Busque un beneficiario..." />
                    <CommandList>
                      <CommandEmpty className="text-sm p-2 text-center">
                        No se ha encontrado ningún beneficiario.
                      </CommandEmpty>
                      <CommandGroup>
                        {vendors?.map((vendor) => (
                          <CommandItem
                            value={vendor.name}
                            key={vendor.id}
                            onSelect={() => {
                              form.setValue("vendor_id", vendor.id.toString());
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                vendor.id.toString() === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {vendor.name}
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
          name="debt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Detalle</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese los detalles" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={createCredit.isPending}>
          {createCredit.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
