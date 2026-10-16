"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateManufacturer } from "@/actions/ajustes/fabricantes/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Manufacturer } from "@/types";
import { ManufacturerFormFields } from "./ManufacturerFormFields";
import {
  buildManufacturerSchema,
  MANUFACTURER_FIELD_LABELS,
  type ManufacturerFormValues,
} from "./manufacturerSchema";

interface FormProps {
  onClose: () => void;
  defaultType?: Manufacturer["type"];
  onSuccess?: (manufacturer: any) => void;
}

export default function CreateManufacturerForm({
  onClose,
  defaultType = "GENERAL",
  onSuccess,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: manufacturers, isSuccess: manufacturersLoaded } =
    useGetManufacturers(selectedCompany?.slug);
  const { createManufacturer } = useCreateManufacturer();

  const schema = useMemo(
    () => buildManufacturerSchema(manufacturers),
    [manufacturers],
  );

  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", type: defaultType },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (manufacturersLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [manufacturersLoaded, manufacturers, form]);

  const onSubmit = async (values: ManufacturerFormValues) => {
    try {
      const result = await createManufacturer.mutateAsync({
        company: selectedCompany?.slug,
        data: values,
      });
      if (result) onSuccess?.(result);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, MANUFACTURER_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createManufacturer.isPending}
        canSave
        submitLabel="Crear fabricante"
        onCancel={onClose}
        // stopPropagation: este form se renderiza dentro de otros formularios
        // (ej. artículos). React propaga el submit por su árbol aunque el
        // Dialog viva en un portal, y dispararía el submit del form padre.
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(MANUFACTURER_FIELD_LABELS),
          )(e);
        }}
      >
        <ManufacturerFormFields
          control={form.control}
          disabled={createManufacturer.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
