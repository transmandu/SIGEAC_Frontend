"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateClient } from "@/actions/mantenimiento/clientes/actions";
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
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";

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
    if (values.dni_type && !values.dni) {
      ctx.addIssue({
        code: "custom",
        path: ["dni"],
        message: "Indique el número de documento.",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface CreateClientFormProps {
  onClose: () => void;
  onCreated?: (client: { id: number; name: string }) => void;
}

export function CreateClientForm({
  onClose,
  onCreated,
}: CreateClientFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createClient } = useCreateClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dni: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  function onSubmit(values: FormValues) {
    createClient.mutate(
      { company: selectedCompany!.slug, data: values },
      {
        onSuccess: (newClient) => {
          onCreated?.(newClient);
          onClose();
        },
      },
    );
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
        <Button
          type="submit"
          data-tour="clientes-crear-submit"
          disabled={createClient.isPending}
        >
          {createClient.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
