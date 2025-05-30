"use client";

import { useCreateSell } from "@/actions/aerolinea/ventas/actions";
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
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    client_id: z.string({
      message: "Debe elegir un cliente.",
    }),
    concept: z
      .string()
      .min(2, {
        message: "El concepto debe tener al menos 2 caracteres.",
      })
      .max(100, {
        message: "El concepto tiene un máximo 100 caracteres.",
      }),
    date: z.date({
      required_error: "La fecha es requerida",
    }),
    reference_pick: z.string(),
    total_price: z
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
      const totalPrice = parseFloat(data.total_price);
      const payedAmount = parseFloat(data.payed_amount);
      return payedAmount <= totalPrice;
    },
    {
      message: "El monto pagado no puede ser mayor que el precio a cobrar",
      path: ["payed_amount"],
    }
  );

interface FormProps {
  onClose: () => void;
  article_id: string;
}

export function SellForm({ onClose, article_id }: FormProps) {
  const { createSell } = useCreateSell();
  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClients();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      ...values,
      articles_id: [article_id],
    };
    createSell.mutate(formattedValues, {
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
            name="client_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cliente</FormLabel>
                <Select
                  disabled={isClientsLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un Cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients &&
                      clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="concept"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="Detalles..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center justify-center">
        <FormField
            control={form.control}
            name="total_price"
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
        <FormField
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
        />
        <Button type="submit" disabled={createSell.isPending}>
          {createSell.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
