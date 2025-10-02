"use client";

import { useCreateClient } from "@/actions/general/clientes/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  dni: z
    .string()
    .min(7, {
      message: "El número de identificación debe tener el formato adecuado.",
    })
    .max(11, {
      message: "El número de identificación tiene un máximo 9 caracteres.",
    }).regex(/^\d+$/, {
      message: "El documento solo puede contener números",
    }),
  dni_type: z.string({
    message: "Debe elegir el tipo de documento.",
  }),
  name: z
    .string()
    .max(40)
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "No se permiten caracteres especiales, solo letras"
    )
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres y maximo 40.",
    }),
  phone: z
    .string()
    .min(10, "El número de tlf debe tener al menos 10 digitos")
    .max(15, "El número de telefono debe tener hasta maximo 15 digitos")
    .regex(phoneRegex, "Número de telefono invalido").optional(),
  email: z.string().email({
    message: "Debe ser un email válido.",
  }).optional(),
  address: z
    .string()
    .min(2, {
      message: "La dirección debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "La dirección tiene un máximo 100 caracteres.",
    }).optional(),
  authorizing: z.enum(["PROPIETARIO", "EXPLOTADOR"], {
    message: "Debe seleccionar si es Propietario o Explotador.",
  }),
  pay_credit_days: z.string().optional()
});

interface FormProps {
  onClose: () => void;
}

export function CreateClientForm({ onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createClient } = useCreateClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createClient.mutate({company: selectedCompany!.slug, data: values});
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
            name="dni_type"
            render={({ field }) => (
              <FormItem >
                <FormLabel>Documento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="V / J" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="V">V</SelectItem>
                    <SelectItem value="J">J</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 12345678"
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +584247000001" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Dirección</FormLabel>
                <FormControl className="w-[420px]">
                  <Input placeholder="Ingresa la dirección" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="authorizing"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de Cliente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de cliente..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                    <SelectItem value="EXPLOTADOR">Explotador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            onCheckedChange={(checked) => setIsAdmin(!!checked)}
            checked={isAdmin}
          />
          <Label>¿Es un cliente administrativo?</Label>

        </div>
        {isAdmin && (
          <FormField
            control={form.control}
            name="pay_credit_days"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Días de crédito</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0 - 730 días"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" disabled={createClient.isPending}>
          {createClient.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
