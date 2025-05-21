"use client";

import { useCreateAdministrationCompany } from "@/actions/administracion/empresa/actions";
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

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  name: z
    .string()
    .max(40, { message: "El nombre debe tener un máximo de 40 caracteres",})
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "No se permiten caracteres especiales, solo letras"
    )
    .min(2, {
      message: "El nombre de la empresa debe tener minimo 2 caracteres.",
    }),
  rif: z.string().min(9, {
    message: "Debe ingresar un RIF válido."
  }).max(11, { message: "Un RIF valido debe tener un máximo de 9 digitos",}),
  fiscal_address: z
    .string()
    .min(2, {
      message: "La dirección fiscal debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "La dirección fiscal tiene un máximo 100 caracteres.",
    }),
  phone_number: z
    .string()
    .min(10, "El número de tlf debe tener al menos 10 digitos")
    .max(15, "El número de telefono debe tener hasta maximo 15 digitos")
    .regex(phoneRegex, "Número de telefono invalido"),
});

interface FormProps {
  onClose: () => void;
}

export function CreateAdministrationCompanyForm({ onClose }: FormProps) {
  const { createAdministrationCompany } = useCreateAdministrationCompany();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createAdministrationCompany.mutate(values, {
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese el nombre"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rif"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RIF</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: J-########" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="fiscal_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Av. Atlantico, Calle 804..." {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +584247000001" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={createAdministrationCompany.isPending}>
          {createAdministrationCompany.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
