"use client";

import { useMemo } from "react";
import { ArrowRightLeft, Briefcase } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { useChangeEmployeeAssignment } from "@/actions/ajustes/empleados/actions";
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
import { locationLabel } from "@/lib/locations";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Employee } from "@/types";
import {
  AssignmentFields,
  LifecycleDateField,
  LifecycleReasonField,
} from "./LifecycleFields";
import { LifecycleSelectField } from "./LifecycleSelectField";
import {
  assignmentChanged,
  buildChangeAssignmentSchema,
  LIFECYCLE_FIELD_LABELS,
  lifecycleToday,
  type ChangeAssignmentValues,
} from "./lifecycleSchema";

const CHANGE_OPTIONS = SELECTABLE_CHANGE_TYPES.map((type) => ({
  id: type,
  label: CHANGE_TYPE_META[type].label,
}));

/** Cambio de cargo, departamento o sede de un empleado que trabaja hoy. */
export function ChangeAssignmentForm({
  employee,
  onSuccess,
}: {
  employee: Employee;
  onSuccess?: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const options = useAssignmentOptions(slug);
  const changeAssignment = useChangeEmployeeAssignment();

  const current = useMemo(
    () => ({
      job_title_id: String(
        employee.assignment?.job_title_id ?? employee.job_title?.id ?? "",
      ),
      department_id: String(
        employee.assignment?.department_id ?? employee.department?.id ?? "",
      ),
      location_id: String(
        employee.assignment?.location_id ?? employee.location?.id ?? "",
      ),
    }),
    [employee],
  );

  const schema = useMemo(
    () => buildChangeAssignmentSchema(employee.assignment?.started_at),
    [employee.assignment?.started_at],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de la asignación vigente.
  const form = useForm<ChangeAssignmentValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...current, reason: "", effective_date: "" },
  });

  const watched = useWatch({ control: form.control });
  const changed = assignmentChanged(current, {
    job_title_id: watched.job_title_id ?? "",
    department_id: watched.department_id ?? "",
    location_id: watched.location_id ?? "",
  });

  const onSubmit = async (values: ChangeAssignmentValues) => {
    if (!slug || !changed) return;

    try {
      await changeAssignment.mutateAsync({
        company: slug,
        id: employee.id,
        // Solo lo que cambia: el backend rechaza una asignación sin cambios.
        ...(values.job_title_id !== current.job_title_id && {
          job_title_id: Number(values.job_title_id),
        }),
        ...(values.department_id !== current.department_id && {
          department_id: Number(values.department_id),
        }),
        ...(values.location_id !== current.location_id && {
          location_id: Number(values.location_id),
        }),
        change_type: values.change_type,
        reason: values.reason.trim() || undefined,
        effective_date: values.effective_date || undefined,
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
        busy={changeAssignment.isPending}
        canSave={changed}
        submitLabel="Registrar cambio"
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
          icon={Briefcase}
          title="Nueva asignación"
          hint="Cambie solo lo que corresponda: lo demás se conserva."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AssignmentFields
              control={form.control}
              disabled={changeAssignment.isPending}
              jobTitles={options.jobTitles}
              departments={options.departments}
              locations={options.locations}
              loading={options.loading}
              current={{
                jobTitle: employee.job_title?.name,
                department: employee.department?.name,
                location: employee.location
                  ? locationLabel(employee.location)
                  : undefined,
              }}
            />
          </div>
        </PanelSection>

        <PanelSection
          icon={ArrowRightLeft}
          title="Motivo del cambio"
          hint="Queda en el historial laboral del empleado."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LifecycleSelectField
              control={form.control}
              name="change_type"
              label="Motivo"
              placeholder="Seleccione..."
              options={CHANGE_OPTIONS}
              required
              disabled={changeAssignment.isPending}
            />
            <LifecycleDateField
              control={form.control}
              name="effective_date"
              label="Fecha del cambio"
              hint="Si se deja vacía, será hoy."
              min={employee.assignment?.started_at}
              max={lifecycleToday()}
              disabled={changeAssignment.isPending}
            />
            <div className="sm:col-span-2">
              <LifecycleReasonField
                control={form.control}
                name="reason"
                label="Detalle"
                placeholder="Explique el cambio (obligatorio si el motivo es «Otro motivo»)"
                required={watched.change_type === "OTHER"}
                disabled={changeAssignment.isPending}
              />
            </div>
          </div>
        </PanelSection>
      </ArticleFormShell>
    </Form>
  );
}
