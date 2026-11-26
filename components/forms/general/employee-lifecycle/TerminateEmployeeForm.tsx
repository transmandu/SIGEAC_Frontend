"use client";

import { useMemo } from "react";
import { UserX } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { useTerminateEmployee } from "@/actions/ajustes/empleados/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { PanelSection } from "@/components/forms/PanelSection";
import { Form } from "@/components/ui/form";
import {
  END_TYPE_META,
  END_TYPES_REQUIRING_REASON,
  SELECTABLE_END_TYPES,
} from "@/lib/employee-lifecycle";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Employee } from "@/types";
import { LifecycleDateField, LifecycleReasonField } from "./LifecycleFields";
import { LifecycleSelectField } from "./LifecycleSelectField";
import {
  buildTerminateSchema,
  LIFECYCLE_FIELD_LABELS,
  lifecycleToday,
  type TerminateValues,
} from "./lifecycleSchema";

const END_OPTIONS = SELECTABLE_END_TYPES.map((type) => ({
  id: type,
  label: END_TYPE_META[type].label,
}));

/** Baja de un empleado: tipo de egreso, fecha y, cuando corresponde, qué ocurrió. */
export function TerminateEmployeeForm({
  employee,
  onSuccess,
}: {
  employee: Employee;
  onSuccess?: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const terminate = useTerminateEmployee();

  const periodStart = employee.period?.started_at ?? employee.start_date;

  const schema = useMemo(
    () => buildTerminateSchema(periodStart),
    [periodStart],
  );

  const form = useForm<TerminateValues>({
    resolver: zodResolver(schema),
    defaultValues: { end_reason: "", end_date: "" },
  });

  const endType = useWatch({ control: form.control, name: "end_type" });

  const onSubmit = async (values: TerminateValues) => {
    if (!slug) return;

    try {
      await terminate.mutateAsync({
        company: slug,
        id: employee.id,
        end_type: values.end_type,
        end_reason: values.end_reason.trim() || undefined,
        end_date: values.end_date || undefined,
      });
      onSuccess?.();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, LIFECYCLE_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={terminate.isPending}
        canSave
        submitLabel="Dar de baja"
        onCancel={onSuccess}
        onSubmit={(event) => {
          event.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(LIFECYCLE_FIELD_LABELS),
          )(event);
        }}
      >
        <PanelSection
          icon={UserX}
          title="Egreso"
          hint="Su historial se conserva: podrá recontratarse más adelante."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LifecycleSelectField
              control={form.control}
              name="end_type"
              label="Tipo de egreso"
              placeholder="Seleccione..."
              options={END_OPTIONS}
              required
              disabled={terminate.isPending}
            />
            <LifecycleDateField
              control={form.control}
              name="end_date"
              label="Fecha de egreso"
              hint="Si se deja vacía, será hoy."
              min={periodStart ?? undefined}
              max={lifecycleToday()}
              disabled={terminate.isPending}
            />
            <div className="sm:col-span-2">
              <LifecycleReasonField
                control={form.control}
                name="end_reason"
                label="Detalle"
                placeholder="Qué ocurrió (opcional según el tipo de egreso)"
                required={
                  !!endType && END_TYPES_REQUIRING_REASON.includes(endType)
                }
                disabled={terminate.isPending}
              />
            </div>
          </div>
        </PanelSection>
      </ArticleFormShell>
    </Form>
  );
}
