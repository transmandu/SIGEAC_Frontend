"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateClient } from "@/actions/aerolinea/clientes/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AirlineClient } from "@/types";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
);

const formSchema = z.object({
  dni: z
    .string()
    .min(7, {
      message: "El número de identificación debe tener el formato adecuado.",
    })
    .max(11, {
      message: "El número de identificación tiene un máximo 11 caracteres.",
    })
    .regex(/^\d+$/, {
      message: "El documento solo puede contener números",
    }),
  dni_type: z.string({
    message: "Debe elegir el tipo de documento.",
  }),
  name: z
    .string()
    .max(40)
    .regex(
      /^[\p{L}\p{N}\s.,&'-]+$/u,
      "El nombre solo admite letras, números, espacios y . , & ' -",
    )
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres y maximo 40.",
    }),
  phone: z
    .string()
    .min(10, "El número de tlf debe tener al menos 10 digitos")
    .max(15, "El número de telefono debe tener hasta maximo 15 digitos")
    .regex(phoneRegex, "Número de telefono invalido"),
  email: z.string().email({
    message: "Debe ser un email válido.",
  }),
  address: z
    .string()
    .min(3, {
      message: "La dirección debe tener al menos 3 caracteres.",
    })
    .max(100, {
      message: "La dirección tiene un máximo 100 caracteres.",
    }),
  pay_credit_days: z.coerce
    .number({ error: "Solo se permiten números" })
    .int("Debe ser un número entero")
    .min(0, { message: "Mínimo 0 días" })
    .max(730, { message: "Máximo 730 días" }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClientFormProps {
  client: AirlineClient;
  onClose: () => void;
}

export function EditClientForm({ onClose, client }: EditClientFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { updateClient } = useUpdateClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: client.dni,
      dni_type: client.dni_type,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      pay_credit_days: client.pay_credit_days ?? 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updateClient.mutateAsync({
        id: client.id.toString(),
        data: values,
        company: selectedCompany!.slug,
      });
      onClose();
    } catch {
      // El aviso lo muestra la mutación; el formulario queda abierto.
    }
  };

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
              <FormItem data-tour="clientes-crear-dni-type">
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem className="w-full" data-tour="clientes-crear-dni">
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
              <FormItem className="w-full" data-tour="clientes-crear-name">
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
              <FormItem className="w-full" data-tour="clientes-crear-phone">
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
              <FormItem className="w-full" data-tour="clientes-crear-email">
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
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="w-full" data-tour="clientes-crear-address">
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Ingresa la dirección" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pay_credit_days"
          render={({ field }) => (
            <FormItem className="w-full" data-tour="clientes-crear-credit">
              <FormLabel>Días de crédito</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0 - 730 días"
                  min={0}
                  max={730}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button type="submit" disabled={updateClient.isPending}>
          {updateClient.isPending ? "Actualizando..." : "Actualizar"}
        </Button>
      </form>
    </Form>
  );
}
