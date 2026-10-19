"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateRetailer } from "@/actions/ajustes/comercios/actions";
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
  RETAILER_FIELD_LABELS,
  type RetailerFormValues,
} from "./retailerSchema";

interface FormProps {
  onClose: () => void;
  /** Called with the newly created retailer after a successful creation. */
  onCreated?: (retailer: Retailer) => void;
}

export default function CreateRetailerForm({ onClose, onCreated }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: retailers, isSuccess: retailersLoaded } = useGetRetailers(
    selectedCompany?.slug,
  );
  const { createRetailer } = useCreateRetailer();

  const schema = useMemo(() => buildRetailerSchema(retailers), [retailers]);

  const form = useForm<RetailerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", address: "" },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (retailersLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [retailersLoaded, retailers, form]);

  const onSubmit = async (values: RetailerFormValues) => {
    try {
      const created = await createRetailer.mutateAsync({
        company: selectedCompany!.slug,
        data: values,
      });
      if (created) onCreated?.(created);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, RETAILER_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createRetailer.isPending}
        canSave
        submitLabel="Crear comercio"
        onCancel={onClose}
        // stopPropagation: este form se renderiza dentro de otros formularios
        // (ej. cotización). React propaga el submit por su árbol aunque el
        // Dialog viva en un portal, y dispararía el submit del form padre.
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
          disabled={createRetailer.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
