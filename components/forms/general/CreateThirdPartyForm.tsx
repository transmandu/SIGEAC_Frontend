"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateThirdParty } from "@/actions/sistema/terceros/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { zodResolver } from "@/lib/zod-resolver";
import { ThirdPartyFormFields } from "./ThirdPartyFormFields";
import {
  buildThirdPartySchema,
  THIRD_PARTY_FIELD_LABELS,
  type ThirdPartyFormValues,
} from "./thirdPartySchema";

interface FormProps {
  onClose: () => void;
}

export default function CreateThirdPartyForm({ onClose }: FormProps) {
  const { data: thirdParties, isSuccess: thirdPartiesLoaded } =
    useGetThirdParties();
  const { createThirdParty } = useCreateThirdParty();

  const schema = useMemo(
    () => buildThirdPartySchema(thirdParties),
    [thirdParties],
  );

  const form = useForm<ThirdPartyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "" },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (thirdPartiesLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [thirdPartiesLoaded, thirdParties, form]);

  const onSubmit = async (values: ThirdPartyFormValues) => {
    try {
      await createThirdParty.mutateAsync(values);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, THIRD_PARTY_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createThirdParty.isPending}
        canSave
        submitLabel="Crear tercero"
        onCancel={onClose}
        // stopPropagation: este form puede renderizarse dentro de otros
        // formularios. React propaga el submit por su árbol aunque el Dialog
        // viva en un portal, y dispararía el submit del form padre.
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
          disabled={createThirdParty.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
