"use client";

import { useUpdateUnit } from "@/actions/ajustes/unidades/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Unit } from "@/types";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { UnitFormFields } from "./UnitFormFields";
import {
  buildUnitSchema,
  diffUnit,
  UNIT_FIELD_LABELS,
  type UnitFormValues,
} from "./unitSchema";

interface FormProps {
  unit: Unit;
  onClose: () => void;
}

export default function UpdateUnitForm({ unit, onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: units } = useGetUnits(selectedCompany?.slug);
  const { updateUnit } = useUpdateUnit();

  const schema = useMemo(
    () => buildUnitSchema(units, unit.id),
    [units, unit.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: unit.label ?? "",
      value: unit.value ?? "",
      is_dimensional: !!unit.is_dimensional,
      allows_fractions: !!unit.allows_fractions,
    },
  });

  const onSubmit = async (values: UnitFormValues) => {
    const changes = diffUnit(unit, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateUnit.mutateAsync({ id: unit.id, ...changes });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, UNIT_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateUnit.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(UNIT_FIELD_LABELS))(e);
        }}
      >
        <UnitFormFields
          control={form.control}
          disabled={updateUnit.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
