"use client";

import { useMemo } from "react";
import { Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";

import { useRehireEmployee } from "@/actions/ajustes/empleados/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { PanelSection } from "@/components/forms/PanelSection";
import { Form } from "@/components/ui/form";
import { useAssignmentOptions } from "@/hooks/ajustes/empleados/useAssignmentOptions";
import { formatCalendarDate } from "@/lib/date";
import { locationLabel } from "@/lib/locations";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Employee } from "@/types";
import { AssignmentFields, LifecycleDateField } from "./LifecycleFields";
import {
  buildRehireSchema,
  LIFECYCLE_FIELD_LABELS,
  lifecycleToday,
  type RehireValues,
} from "./lifecycleSchema";

/**
 * Recontratación de quien ya egresó: abre un periodo nuevo y su asignación
 * inicial, que parte de lo último que tuvo para cambiar solo lo que haga falta.
 */
export function RehireEmployeeForm({
  employee,
  onSuccess,
}: {
  employee: Employee;
  onSuccess?: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const options = useAssignmentOptions(slug);
  const rehire = useRehireEmployee();

  const lastEndedAt = employee.period?.ended_at ?? employee.end_date;

  const schema = useMemo(() => buildRehireSchema(lastEndedAt), [lastEndedAt]);

  const form = useForm<RehireValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_title_id: String(
        employee.assignment?.job_title_id ?? employee.job_title?.id ?? "",
      ),
      department_id: String(
        employee.assignment?.department_id ?? employee.department?.id ?? "",
      ),
      location_id: String(
        employee.assignment?.location_id ?? employee.location?.id ?? "",
      ),
      start_date: "",
    },
  });

  const onSubmit = async (values: RehireValues) => {
    if (!slug) return;

    try {
      await rehire.mutateAsync({
        company: slug,
        id: employee.id,
        job_title_id: Number(values.job_title_id),
        department_id: Number(values.department_id),
        location_id: Number(values.location_id),
        start_date: values.start_date || undefined,
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
        busy={rehire.isPending}
        canSave
        submitLabel="Recontratar"
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
          title="Asignación inicial"
          hint={
            lastEndedAt
              ? `Egresó el ${formatCalendarDate(lastEndedAt, "date", "")}. Parte de lo último que tuvo; cámbielo si corresponde.`
              : "Parte de lo último que tuvo; cámbielo si corresponde."
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AssignmentFields
              control={form.control}
              disabled={rehire.isPending}
              jobTitles={options.jobTitles}
              departments={options.departments}
              locations={options.locations}
              loading={options.loading}
              referenceLabel="Último"
              current={{
                jobTitle: employee.job_title?.name,
                department: employee.department?.name,
                location: employee.location
                  ? locationLabel(employee.location)
                  : undefined,
              }}
            />
            <LifecycleDateField
              control={form.control}
              name="start_date"
              label="Fecha de reingreso"
              hint="Si se deja vacía, será hoy."
              min={lastEndedAt ?? undefined}
              max={lifecycleToday()}
              disabled={rehire.isPending}
            />
          </div>
        </PanelSection>
      </ArticleFormShell>
    </Form>
  );
}
