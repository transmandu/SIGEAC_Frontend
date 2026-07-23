"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreateVendor } from "@/actions/ajustes/globales/proveedores/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .max(30, { message: "El nombre tiene un máximo de 30 caracteres." }),
  email: z.string().email({ message: "Debe ser un email válido." }),
  phone: z
    .string()
    .min(1, { message: "El teléfono es requerido." })
    .max(20, { message: "El teléfono tiene un máximo de 20 caracteres." }),
  address: z
    .string()
    .min(2, { message: "La dirección debe tener al menos 2 caracteres." })
    .max(100, { message: "La dirección tiene un máximo de 100 caracteres." }),
  type: z.enum(["VENDOR", "BENEFICIARY"], {
    required_error: "Selecciona un tipo.",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface Props {
  onClose: () => void;
  initialValues?: FormSchemaType;
  onSubmit?: (data: FormSchemaType) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateVendorForm({
  onClose,
  initialValues,
  onSubmit,
  isLoading: externalLoading,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const createVendor = useCreateVendor(selectedCompany?.slug);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues ?? {
      name: "",
      email: "",
      phone: "",
      address: "",
      type: undefined,
    },
  });

  const handleSubmit = async (data: FormSchemaType) => {
    if (onSubmit) {
      await onSubmit(data);
      onClose();
      return;
    }
    try {
      await createVendor.mutateAsync(data);
      onClose();
    } catch (error) {
      // El error ya se notifica mediante el toast del hook de mutación.
    }
  };

  const isLoading = onSubmit ? externalLoading : createVendor.isPending;

  return (
    <Form {...form}>
      {/* stopPropagation: este form se renderiza dentro de otros formularios
          (ej. cotización). React propaga el submit por su árbol aunque el
          Dialog viva en un portal, y dispararía el submit del form padre. */}
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(handleSubmit)(e);
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem data-tour="proveedores-dialog-name">
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Boeing, Airbus, etc..." {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem data-tour="proveedores-dialog-phone">
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +584247000001" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem data-tour="proveedores-dialog-email">
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ej: contacto@proveedor.com"
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
            <FormItem data-tour="proveedores-dialog-address">
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Ubicación fiscal" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem data-tour="proveedores-dialog-type">
              <FormLabel>Tipo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VENDOR">Proveedor</SelectItem>
                  <SelectItem value="BENEFICIARY">Beneficiario</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70 flex items-center justify-center gap-2"
          disabled={isLoading}
          data-tour="proveedores-dialog-submit"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : onSubmit ? (
            "Actualizar Proveedor"
          ) : (
            "Crear Proveedor"
          )}
        </Button>
      </form>
    </Form>
  );
}
