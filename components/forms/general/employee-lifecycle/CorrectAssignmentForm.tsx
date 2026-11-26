"use client";

import { useMemo } from "react";
import { ArrowRightLeft, Briefcase } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { useCorrectEmployeeAssignment } from "@/actions/ajustes/empleados/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { PanelSection } from "@/components/forms/PanelSection";
import { Form } from "@/components/ui/form";
import { useAssignmentOptions } from "@/hooks/ajustes/empleados/useAssignmentOptions";
import {
  CHANGE_TYPE_META,
  SELECTABLE_CHANGE_TYPES,
} from "@/lib/employee-lifecycle";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Employee, EmployeeAssignment } from "@/types";
import {
  AssignmentFields,
  LifecycleDateField,
  LifecycleReasonField,
} from "./LifecycleFields";
import { LifecycleSelectField } from "./LifecycleSelectField";
import {
  buildCorrectAssignmentSchema,
  type CorrectAssignmentValues,
  LIFECYCLE_FIELD_LABELS,
  lifecycleToday,
} from "./lifecycleSchema";

const CHANGE_OPTIONS = SELECTABLE_CHANGE_TYPES.map((type) => ({
  id: type,
  label: CHANGE_TYPE_META[type].label,
}));

/**
 * Corrección de una asignación del historial. La primera de cada periodo
 * (`first`) empieza el día del ingreso y no tiene motivo propio: de ella solo
 * se corrigen cargo, departamento y sede.
 */
export function CorrectAssignmentForm({
  employee,
  assignment,
  first,
  onSuccess,
}: {
  employee: Employee;
  assignment: EmployeeAssignment;
  first: boolean;
  onSuccess?: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const options = useAssignmentOptions(slug);
  const correct = useCorrectEmployeeAssignment();

  const initial = useMemo<CorrectAssignmentValues>(
    () => ({
      job_title_id: String(assignment.job_title_id),
      department_id: String(assignment.department_id),
      location_id: String(assignment.location_id),
      started_at: assignment.started_at,
      change_type: first ? "" : assignment.change_type,
      reason: assignment.reason ?? "",
    }),
    [assignment, first],
  );

  const schema = useMemo(() => buildCorrectAssignmentSchema(first), [first]);

  const form = useForm<CorrectAssignmentValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

  const watched = useWatch({ control: form.control });
  const changed =
    watched.job_title_id !== initial.job_title_id ||
    watched.department_id !== initial.department_id ||
    watched.location_id !== initial.location_id ||
    (!first &&
      (watched.started_at !== initial.started_at ||
        watched.change_type !== initial.change_type ||
        (watched.reason ?? "").trim() !== initial.reason));

  const onSubmit = async (values: CorrectAssignmentValues) => {
    if (!slug || !changed) return;

    try {
      await correct.mutateAsync({
        company: slug,
        id: employee.id,
        assignmentId: assignment.id,
        ...(values.job_title_id !== initial.job_title_id && {
          job_title_id: Number(values.job_title_id),
        }),
        ...(values.department_id !== initial.department_id && {
          department_id: Number(values.department_id),
        }),
        ...(values.location_id !== initial.location_id && {
          location_id: Number(values.location_id),
        }),
        ...(!first && {
          ...(values.started_at !== initial.started_at && {
            started_at: values.started_at,
          }),
          change_type:
            values.change_type as (typeof SELECTABLE_CHANGE_TYPES)[number],
          reason: values.reason.trim(),
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
        <PanelSection icon={Briefcase} title="Asignación">
          <div className="grid gap-4 sm:grid-cols-2">
            <AssignmentFields
              control={form.control}
              disabled={correct.isPending}
              jobTitles={options.jobTitles}
              departments={options.departments}
              locations={options.locations}
              loading={options.loading}
            />
          </div>
        </PanelSection>

        {!first && (
          <PanelSection
            icon={ArrowRightLeft}
            title="Cuándo y por qué"
            hint="Cambiar la fecha mueve también el fin de la asignación anterior."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <LifecycleSelectField
                control={form.control}
                name="change_type"
                label="Motivo"
                placeholder="Seleccione..."
                options={CHANGE_OPTIONS}
                required
                disabled={correct.isPending}
              />
              <LifecycleDateField
                control={form.control}
                name="started_at"
                label="Fecha del cambio"
                max={lifecycleToday()}
                disabled={correct.isPending}
              />
              <div className="sm:col-span-2">
                <LifecycleReasonField
                  control={form.control}
                  name="reason"
                  label="Detalle"
                  placeholder="Explique el cambio (obligatorio si el motivo es «Otro motivo»)"
                  required={watched.change_type === "OTHER"}
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
