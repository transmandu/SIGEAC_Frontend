"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateInformationSource } from "@/actions/ajustes/tipos_fuente/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { InformationSourceFormFields } from "./InformationSourceFormFields";
import {
  buildInformationSourceSchema,
  INFORMATION_SOURCE_FIELD_LABELS,
  type InformationSourceFormValues,
} from "./informationSourceSchema";

interface FormProps {
  onClose: () => void;
}

export function CreateInformationSourceForm({ onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: sources, isSuccess: sourcesLoaded } =
    useGetInformationSources();
  const { createInformationSource } = useCreateInformationSource();

  const schema = useMemo(
    () => buildInformationSourceSchema(sources),
    [sources],
  );

  const form = useForm<InformationSourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: undefined },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (sourcesLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [sourcesLoaded, sources, form]);

  const onSubmit = async (values: InformationSourceFormValues) => {
    try {
      await createInformationSource.mutateAsync({
        company: selectedCompany!.slug,
        data: values,
      });
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(
          form.setError,
          errors,
          INFORMATION_SOURCE_FIELD_LABELS,
        );
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createInformationSource.isPending}
        canSave
        submitLabel="Crear fuente"
        onCancel={onClose}
        // stopPropagation: este form puede renderizarse dentro de otros
        // formularios. React propaga el submit por su árbol aunque el Dialog
        // viva en un portal, y dispararía el submit del form padre.
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(INFORMATION_SOURCE_FIELD_LABELS),
          )(e);
        }}
      >
        <InformationSourceFormFields
          control={form.control}
          disabled={createInformationSource.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
