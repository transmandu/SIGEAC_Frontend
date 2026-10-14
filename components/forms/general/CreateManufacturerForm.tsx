"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@/lib/zod-resolver";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  useCreateManufacturer,
  useUpdateManufacturer,
} from "@/actions/ajustes/fabricantes/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Manufacturer } from "@/types";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  description: z.string().optional(),
  type: z.enum(
    ["AIRCRAFT", "ENGINE", "APU", "PROPELLER", "GENERAL", "PART", "TOOL"],
    {
      error: "Debe seleccionar un tipo",
    },
  ),
});

interface FormProps {
  onClose: () => void;
  defaultType?:
    "AIRCRAFT" | "ENGINE" | "APU" | "PROPELLER" | "GENERAL" | "PART" | "TOOL";
  onSuccess?: (manufacturer: any) => void;
  /** Con fabricante, el formulario edita en lugar de crear. */
  manufacturer?: Manufacturer;
}

export default function CreateManufacturerForm({
  onClose,
  defaultType = "GENERAL",
  onSuccess,
  manufacturer,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();

  const { createManufacturer } = useCreateManufacturer();
  const { updateManufacturer } = useUpdateManufacturer();
  const mutation = manufacturer ? updateManufacturer : createManufacturer;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: manufacturer?.name ?? "",
      type: manufacturer?.type ?? defaultType,
      description: manufacturer?.description ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = { ...values, description: values.description || "" };
      const result = manufacturer
        ? await updateManufacturer.mutateAsync({
            company: selectedCompany?.slug,
            id: manufacturer.id,
            data,
          })
        : await createManufacturer.mutateAsync({
            company: selectedCompany?.slug,
            data,
          });
      if (onSuccess && result) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation(); //evita que el submit se propague al formulario padre
          form.handleSubmit(onSubmit)(e); //  ejecuta el submit localmente
        }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Fabricante</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Boeing, Airbus, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Este será el nombre del fabricante.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="EJ: The Boeing Company" {...field} />
              </FormControl>
              <FormDescription>
                Opcional. Se muestra como nombre completo en el listado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AIRCRAFT">Aeronave</SelectItem>
                  <SelectItem value="ENGINE">Plantas de Poder</SelectItem>
                  <SelectItem value="APU">APU</SelectItem>
                  <SelectItem value="PROPELLER">Hélice</SelectItem>
                  <SelectItem value="GENERAL">Piezas en General</SelectItem>
                  <SelectItem value="PART">Partes/Componentes</SelectItem>
                  <SelectItem value="TOOL">Herramientas</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Indique el tipo de fabricante.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>{manufacturer ? "Actualizar" : "Crear"}</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
