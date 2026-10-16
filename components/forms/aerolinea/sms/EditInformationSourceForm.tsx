"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateInformationSource } from "@/actions/ajustes/tipos_fuente/actions";
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
import { InformationSource } from "@/types";
import { InformationSourceFormFields } from "./InformationSourceFormFields";
import {
  buildInformationSourceSchema,
  diffInformationSource,
  INFORMATION_SOURCE_FIELD_LABELS,
  type InformationSourceFormValues,
} from "./informationSourceSchema";

interface FormProps {
  onClose: () => void;
  initialData: InformationSource;
}

export function EditInformationSourceForm({ onClose, initialData }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: sources } = useGetInformationSources();
  const { updateInformationSource } = useUpdateInformationSource();

  const schema = useMemo(
    () => buildInformationSourceSchema(sources, initialData.id),
    [sources, initialData.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<InformationSourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData.name ?? "",
      type: initialData.type,
    },
  });

  const onSubmit = async (values: InformationSourceFormValues) => {
    const changes = diffInformationSource(initialData, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateInformationSource.mutateAsync({
        company: selectedCompany!.slug,
        id: initialData.id.toString(),
        data: changes,
      });
      onClose();
    } catch (error) {
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
        isEditing
        busy={updateInformationSource.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
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
          disabled={updateInformationSource.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
