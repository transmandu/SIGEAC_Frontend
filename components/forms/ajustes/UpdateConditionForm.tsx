"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetConditions } from "@/hooks/general/condiciones/useGetConditions";
import { zodResolver } from "@/lib/zod-resolver";
import { Condition } from "@/types";
import { ConditionFormFields } from "./ConditionFormFields";
import {
  buildConditionSchema,
  CONDITION_FIELD_LABELS,
  diffCondition,
  type ConditionFormValues,
} from "./conditionSchema";

interface FormProps {
  condition: Condition;
  onClose: () => void;
}

export default function UpdateConditionForm({ condition, onClose }: FormProps) {
  const { data: conditions } = useGetConditions();
  const { updateCondition } = useUpdateCondition();

  const schema = useMemo(
    () => buildConditionSchema(conditions, condition.id),
    [conditions, condition.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: condition.name ?? "",
      description: condition.description ?? "",
      excluded_from_cost: !!condition.excluded_from_cost,
    },
  });

  const onSubmit = async (values: ConditionFormValues) => {
    const changes = diffCondition(condition, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateCondition.mutateAsync({ id: condition.id, data: changes });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, CONDITION_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateCondition.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(CONDITION_FIELD_LABELS),
          )(e);
        }}
      >
        <ConditionFormFields
          control={form.control}
          disabled={updateCondition.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
