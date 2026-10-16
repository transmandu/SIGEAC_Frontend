"use client";
import { useCreateUnit } from "@/actions/ajustes/unidades/actions";
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
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { UnitFormFields } from "./UnitFormFields";
import {
  buildUnitSchema,
  UNIT_FIELD_LABELS,
  type UnitFormValues,
} from "./unitSchema";

interface FormProps {
  onClose: () => void;
  onSuccess?: (unitData: { value: string; label: string }) => void;
  /** Called with the full created unit (incl. id) after a successful creation. */
  onCreated?: (unit: Unit) => void;
}

export default function CreateUnitForm({
  onClose,
  onSuccess,
  onCreated,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: units, isSuccess: unitsLoaded } = useGetUnits(
    selectedCompany?.slug,
  );
  const { createUnit } = useCreateUnit();

  const schema = useMemo(() => buildUnitSchema(units), [units]);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", value: "", is_dimensional: false },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (!unitsLoaded) return;
    const { label, value } = form.formState.dirtyFields;
    if (label) form.trigger("label");
    if (value) form.trigger("value");
  }, [unitsLoaded, units, form]);

  const onSubmit = async (values: UnitFormValues) => {
    try {
      const unit = await createUnit.mutateAsync(values);
      onSuccess?.(values);
      if (unit) onCreated?.(unit);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, UNIT_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createUnit.isPending}
        canSave
        submitLabel="Crear unidad"
        onCancel={onClose}
        // stopPropagation: este form se renderiza dentro de otros formularios
        // (ej. cotización). React propaga el submit por su árbol aunque el
        // Dialog viva en un portal, y dispararía el submit del form padre.
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(UNIT_FIELD_LABELS))(e);
        }}
      >
        <UnitFormFields
          control={form.control}
          disabled={createUnit.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
