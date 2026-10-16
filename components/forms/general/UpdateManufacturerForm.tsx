"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateManufacturer } from "@/actions/ajustes/fabricantes/actions";
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
  diffManufacturer,
  MANUFACTURER_FIELD_LABELS,
  type ManufacturerFormValues,
} from "./manufacturerSchema";

interface FormProps {
  manufacturer: Manufacturer;
  onClose: () => void;
}

export default function UpdateManufacturerForm({
  manufacturer,
  onClose,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: manufacturers } = useGetManufacturers(selectedCompany?.slug);
  const { updateManufacturer } = useUpdateManufacturer();

  const schema = useMemo(
    () => buildManufacturerSchema(manufacturers, manufacturer.id),
    [manufacturers, manufacturer.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: manufacturer.name ?? "",
      description: manufacturer.description ?? "",
      type: manufacturer.type,
    },
  });

  const onSubmit = async (values: ManufacturerFormValues) => {
    const changes = diffManufacturer(manufacturer, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateManufacturer.mutateAsync({
        company: selectedCompany?.slug,
        id: manufacturer.id,
        data: changes,
      });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(
          form.setError,
          errors,
          MANUFACTURER_FIELD_LABELS,
        );
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateManufacturer.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
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
          disabled={updateManufacturer.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
