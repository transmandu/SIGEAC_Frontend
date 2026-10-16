"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateCondition } from "@/actions/aerolinea/almacen/condiciones_articulos/actions";
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
  type ConditionFormValues,
} from "./conditionSchema";

interface FormProps {
  onClose: () => void;
  onSuccess?: (condition: Condition) => void;
}

export function CreateConditionForm({ onClose, onSuccess }: FormProps) {
  const { data: conditions, isSuccess: conditionsLoaded } =
    useGetConditions();
  const { createCondition } = useCreateCondition();

  const schema = useMemo(() => buildConditionSchema(conditions), [conditions]);

  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      excluded_from_cost: false,
    },
  });

  // El nombre se valida contra el catálogo: si este llega después de que el
  // usuario ya escribió, hay que volver a validarlo.
  useEffect(() => {
    if (conditionsLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [conditionsLoaded, conditions, form]);

  const onSubmit = async (values: ConditionFormValues) => {
    try {
      const condition = await createCondition.mutateAsync(values);
      onSuccess?.(condition);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, CONDITION_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createCondition.isPending}
        canSave
        submitLabel="Crear condición"
        onCancel={onClose}
        // stopPropagation: este form se renderiza dentro de otros formularios
        // (ej. cotización). React propaga el submit por su árbol aunque el
        // Dialog viva en un portal, y dispararía el submit del form padre.
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
          disabled={createCondition.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
