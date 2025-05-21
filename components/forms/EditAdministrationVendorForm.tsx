"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateAdministrationVendor } from "@/actions/administracion/proveedor/actions";
import { useGetAdministrationVendorById } from "@/hooks/administracion/useGetAdministrationVendorById";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
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
    .regex(phoneRegex, "Número de telefono invalido"),
  email: z.string().email({
    message: "Debe ser un email válido.",
  }),
  address: z
    .string()
    .min(2, {
      message: "La dirección debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "La dirección tiene un máximo 100 caracteres.",
    }),
  type: z.enum(["BENEFICIARIO", "PROVEEDOR"]),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface EditAdministrationVendorFormProps {
  id: string;
  onClose: () => void;
}

export function EditAdministrationVendorForm({
  id,
  onClose,
}: EditAdministrationVendorFormProps) {
  const { data: vendorDetails, isLoading } = useGetAdministrationVendorById(id);
  const { updateAdministrationVendor } = useUpdateAdministrationVendor();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vendorDetails?.name,
      phone: vendorDetails?.phone,
      email: vendorDetails?.email,
      address: vendorDetails?.address,
      type: vendorDetails?.type,
    },
  });

  const OnSubmit = async (formData: FormSchemaType) => {
    const data = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      type: formData.type,
    };
    await updateAdministrationVendor.mutate({ id, data });
    onClose();
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(OnSubmit)} className="space-y-3">
        <div className="flex gap-2 items-center justify-center">
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
        </div>
        <div className="flex gap-2 items-center justify-center">
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
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa la dirección" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PROVEEDOR">Proveedor</SelectItem>
                  <SelectItem value="BENEFICIARIO">Beneficiario</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateAdministrationVendor.isPending}>
          {updateAdministrationVendor.isPending
            ? "Actualizando..."
            : "Actualizar"}
        </Button>
      </form>
    </Form>
  );
}
