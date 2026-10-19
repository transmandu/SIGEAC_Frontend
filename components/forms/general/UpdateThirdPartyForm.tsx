"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateThirdParty } from "@/actions/sistema/terceros/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { zodResolver } from "@/lib/zod-resolver";
import { ThirdParty } from "@/types";
import { ThirdPartyFormFields } from "./ThirdPartyFormFields";
import {
  buildThirdPartySchema,
  diffThirdParty,
  THIRD_PARTY_FIELD_LABELS,
  type ThirdPartyFormValues,
} from "./thirdPartySchema";

interface FormProps {
  thirdParty: ThirdParty;
  onClose: () => void;
}

export default function UpdateThirdPartyForm({
  thirdParty,
  onClose,
}: FormProps) {
  const { data: thirdParties } = useGetThirdParties();
  const { updateThirdParty } = useUpdateThirdParty();

  const schema = useMemo(
    () => buildThirdPartySchema(thirdParties, thirdParty),
    [thirdParties, thirdParty],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<ThirdPartyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: thirdParty.name ?? "",
      type: thirdParty.type ?? "",
    },
  });

  const onSubmit = async (values: ThirdPartyFormValues) => {
    const changes = diffThirdParty(thirdParty, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateThirdParty.mutateAsync({ id: thirdParty.id, data: changes });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, THIRD_PARTY_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateThirdParty.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(THIRD_PARTY_FIELD_LABELS),
          )(e);
        }}
      >
        <ThirdPartyFormFields
          control={form.control}
          disabled={updateThirdParty.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
