"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateClient } from "@/actions/mantenimiento/clientes/actions";
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
import type { AeronauticalClient } from "@/types";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
);

// Vacío es válido (el campo es opcional); si trae texto, se valida con su regla.
const optional = (schema: z.ZodString) =>
  z.string().superRefine((value, ctx) => {
    if (value === "") return;
    const result = schema.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message });
      }
    }
  });

const formSchema = z
  .object({
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
    authorizing: z.enum(["PROPIETARIO", "EXPLOTADOR"], {
      message: "Debe seleccionar si es Propietario o Explotador.",
    }),
    dni_type: z.string().optional(),
    dni: optional(
      z
        .string()
        .min(7, {
          message:
            "El número de identificación debe tener el formato adecuado.",
        })
        .max(11, {
          message: "El número de identificación tiene un máximo 11 caracteres.",
        })
        .regex(/^\d+$/, {
          message: "El documento solo puede contener números",
        }),
    ),
    phone: optional(
      z
        .string()
        .min(10, "El número de tlf debe tener al menos 10 digitos")
        .max(15, "El número de telefono debe tener hasta maximo 15 digitos")
        .regex(phoneRegex, "Número de telefono invalido"),
    ),
    email: optional(z.string().email({ message: "Debe ser un email válido." })),
    address: optional(
      z
        .string()
        .min(3, { message: "La dirección debe tener al menos 3 caracteres." })
        .max(100, { message: "La dirección tiene un máximo 100 caracteres." }),
    ),
  })
  .superRefine((values, ctx) => {
    if (values.dni && !values.dni_type) {
      ctx.addIssue({
        code: "custom",
        path: ["dni_type"],
        message: "Elija el tipo de documento.",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface EditClientFormProps {
  client: AeronauticalClient;
  onClose: () => void;
}

export function EditClientForm({ onClose, client }: EditClientFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { updateClient } = useUpdateClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client.name,
      dni_type: client.dni_type ?? undefined,
      dni: client.dni ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
      authorizing: client.authorizing ?? undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updateClient.mutateAsync({
        id: client.id.toString(),
        data: { ...values, dni_type: values.dni ? values.dni_type : null },
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
          name="authorizing"
          render={({ field }) => (
            <FormItem className="w-full" data-tour="clientes-crear-authorizing">
              <FormLabel>Tipo de Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
