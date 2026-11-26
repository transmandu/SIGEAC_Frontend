"use client";

import { useMemo } from "react";
import { CalendarRange, LogOut } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { useCorrectEmploymentPeriod } from "@/actions/ajustes/empleados/actions";
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
import type { Employee, EmployeeHistoryPeriod } from "@/types";
import { LifecycleDateField, LifecycleReasonField } from "./LifecycleFields";
import { LifecycleSelectField } from "./LifecycleSelectField";
import {
  buildCorrectPeriodSchema,
  type CorrectPeriodValues,
  LIFECYCLE_FIELD_LABELS,
  lifecycleToday,
} from "./lifecycleSchema";

const END_OPTIONS = SELECTABLE_END_TYPES.map((type) => ({
  id: type,
  label: END_TYPE_META[type].label,
}));

/** Corrección de las fechas de un periodo ya registrado y, si terminó, de cómo terminó. */
export function CorrectPeriodForm({
  employee,
  period,
  onSuccess,
}: {
  employee: Employee;
  period: EmployeeHistoryPeriod;
  onSuccess?: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const correct = useCorrectEmploymentPeriod();
  const closed = period.ended_at !== null;

  const initial = useMemo<CorrectPeriodValues>(
    () => ({
      started_at: period.started_at,
      ended_at: period.ended_at ?? "",
      end_type: period.end_type ?? "",
      end_reason: period.end_reason ?? "",
    }),
    [period],
  );

  const schema = useMemo(() => buildCorrectPeriodSchema(closed), [closed]);

  const form = useForm<CorrectPeriodValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

  const watched = useWatch({ control: form.control });
  const changed =
    watched.started_at !== initial.started_at ||
    (closed &&
      (watched.ended_at !== initial.ended_at ||
        watched.end_type !== initial.end_type ||
        (watched.end_reason ?? "").trim() !== initial.end_reason));

  const onSubmit = async (values: CorrectPeriodValues) => {
    if (!slug || !changed) return;

    try {
      await correct.mutateAsync({
        company: slug,
        id: employee.id,
        periodId: period.id,
        ...(values.started_at !== initial.started_at && {
          started_at: values.started_at,
        }),
        ...(closed && {
          ...(values.ended_at !== initial.ended_at && {
            ended_at: values.ended_at,
          }),
          ...(values.end_type !== initial.end_type && {
            end_type: values.end_type as (typeof SELECTABLE_END_TYPES)[number],
          }),
          end_reason: values.end_reason.trim(),
        }),
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
        busy={correct.isPending}
        canSave={changed}
        submitLabel="Guardar corrección"
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
          icon={CalendarRange}
          title="Ingreso"
          hint="La primera asignación del periodo empieza el mismo día."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LifecycleDateField
              control={form.control}
              name="started_at"
              label="Fecha de ingreso"
              max={lifecycleToday()}
              disabled={correct.isPending}
            />
          </div>
        </PanelSection>

        {closed && (
          <PanelSection
            icon={LogOut}
            title="Egreso"
            hint="La última asignación del periodo termina el mismo día."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <LifecycleSelectField
                control={form.control}
                name="end_type"
                label="Tipo de egreso"
                placeholder="Seleccione..."
                options={END_OPTIONS}
                required
                disabled={correct.isPending}
              />
              <LifecycleDateField
                control={form.control}
                name="ended_at"
                label="Fecha de egreso"
                min={watched.started_at || undefined}
                max={lifecycleToday()}
                disabled={correct.isPending}
              />
              <div className="sm:col-span-2">
                <LifecycleReasonField
                  control={form.control}
                  name="end_reason"
                  label="Detalle"
                  placeholder="Qué ocurrió (opcional según el tipo de egreso)"
                  required={END_TYPES_REQUIRING_REASON.some(
                    (type) => type === watched.end_type,
                  )}
                  disabled={correct.isPending}
                />
              </div>
            </div>
          </PanelSection>
        )}
      </ArticleFormShell>
    </Form>
  );
}
