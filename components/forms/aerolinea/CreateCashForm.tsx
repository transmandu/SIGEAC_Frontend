"use client";

import { useCreateCash } from "@/actions/aerolinea/cajas/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../../ui/select";

const formSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "No se permiten caracteres especiales, solo letras"
    )
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    })
    .max(30, {
      message: "El nombre tiene un máximo 30 caracteres.",
    }),
  total_amount: z.string().refine(
    (val) => {
      // Convertir el valor a número y verificar que sea positivo
      const number = parseFloat(val);
      return !isNaN(number) && number >= 0;
    },
    {
      message: "El monto total debe ser un número positivo.",
    }
  ),
  coin: z.enum(["BOLIVARES", "DOLARES", "EUROS"]),
  type: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
});

interface FormProps {
  onClose: () => void;
}

export function CreateCashForm({ onClose }: FormProps) {
  const { createCash } = useCreateCash();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createCash.mutate(values, {
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre de la caja" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total_amount"
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
        <FormField
          control={form.control}
          name="coin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ingrese el tipo de moneda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BOLIVARES">Bolívares</SelectItem>
                  <SelectItem value="DOLARES">Dolares</SelectItem>
                  <SelectItem value="EUROS">Euros</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transacción</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ingrese el tipo de transacción" />
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
        <Button type="submit" disabled={createCash.isPending}>
          {createCash.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
