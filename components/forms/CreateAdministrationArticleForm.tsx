"use client";

import { useCreateAdministrationArticle } from "@/actions/aerolinea/articulos/actions";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const formSchema = z.object({
  serial: z.string().min(2, {
    message: "El serial debe tener al menos 2 caracteres.",
  }).max(8, {
    message: "El serial tiene un máximo 8 caracteres.",
  }),
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(40, {
    message: "El nombre tiene un máximo 40 caracteres.",
  }),
  status: z.enum(["VENDIDO", "EN POSESION", "RENTADO"]),
  price: z.string().refine(
    (val) => {
      // Convertir el valor a número y verificar que sea positivo
      const number = parseFloat(val);
      return !isNaN(number) && number > 0;
    },
    {
      message: "El monto debe ser mayor a cero.",
    }
  ),
  brand: z.string().min(2, {
    message: "La marca debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "La marca tiene un máximo 100 caracteres.",
  }),
  type: z.string().min(2, {
    message: "El tipo debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El tipo tiene un máximo 100 caracteres.",
  }),
});

interface FormProps {
  onClose: () => void;
}

export function CreateAdministrationArticleForm({ onClose }: FormProps) {
  const { createAdministrationArticle } = useCreateAdministrationArticle();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createAdministrationArticle.mutate(values, {
      onSuccess: () => {
        onClose(); // Cierra el modal solo si la creación fue exitosa
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
      <div className='flex gap-2 items-center justify-center'>
      <FormField
          control={form.control}
          name="serial"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Serial</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el serial" {...field} />
              </FormControl>
              <FormMessage className="text-xs"/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ingresa el nombre" {...field} />
              </FormControl>
              <FormMessage className="text-xs"/>
            </FormItem>
          )}
        />
      </div>
      <div className='flex gap-2 items-center justify-center'>
      <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Estado</FormLabel>
              <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VENDIDO">Vendido</SelectItem>
                    <SelectItem value="EN POSESION">En Posesión</SelectItem>
                    <SelectItem value="RENTADO">Rentado</SelectItem>
                  </SelectContent>
                </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Precio </FormLabel>
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
        <div className='flex gap-2 items-center justify-center'>
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese la marca" {...field} />
              </FormControl>
              <FormMessage className="text-xs"/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el tipo" {...field} />
              </FormControl>
              <FormMessage className="text-xs"/>
            </FormItem>
          )}
        />
        </div>

        <Button type="submit" disabled={createAdministrationArticle.isPending}>
          {createAdministrationArticle.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
