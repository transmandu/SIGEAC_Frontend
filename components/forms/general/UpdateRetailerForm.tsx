"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateRetailer } from "@/actions/ajustes/comercios/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetRetailers } from "@/hooks/general/comercios/useGetRetailers";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Retailer } from "@/types";
import { RetailerFormFields } from "./RetailerFormFields";
import {
  buildRetailerSchema,
  diffRetailer,
  RETAILER_FIELD_LABELS,
  type RetailerFormValues,
} from "./retailerSchema";

interface FormProps {
  retailer: Retailer;
  onClose: () => void;
}

export default function UpdateRetailerForm({ retailer, onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: retailers } = useGetRetailers(selectedCompany?.slug);
  const { updateRetailer } = useUpdateRetailer();

  const schema = useMemo(
    () => buildRetailerSchema(retailers, retailer.id),
    [retailers, retailer.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<RetailerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: retailer.name ?? "",
      phone: retailer.phone ?? "",
      address: retailer.address ?? "",
    },
  });

  const onSubmit = async (values: RetailerFormValues) => {
    const changes = diffRetailer(retailer, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateRetailer.mutateAsync({
        company: selectedCompany!.slug,
        id: retailer.id,
        data: changes,
      });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, RETAILER_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateRetailer.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(RETAILER_FIELD_LABELS),
          )(e);
        }}
      >
        <RetailerFormFields
          control={form.control}
          disabled={updateRetailer.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
