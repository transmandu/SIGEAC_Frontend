"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdatePilot } from "@/actions/ajustes/piloto/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Pilot } from "@/types";
import { PilotFormFields } from "./PilotFormFields";
import {
  buildPilotSchema,
  diffPilot,
  PILOT_FIELD_LABELS,
  type PilotFormValues,
} from "./pilotSchema";

interface FormProps {
  pilot: Pilot;
  onClose: () => void;
}

export function UpdatePilotForm({ pilot, onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { updatePilot } = useUpdatePilot();
  const { data: employees, isLoading: employeesLoading } =
    useGetEmployeesByCompany(selectedCompany?.slug);
  const { data: pilots } = useGetPilots(selectedCompany?.slug);

  const schema = useMemo(
    () => buildPilotSchema(pilots, pilot.id),
    [pilots, pilot.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<PilotFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employee_dni: pilot.employee_dni ?? "",
      license_number: pilot.license_number ?? "",
    },
  });

  // El empleado es fijo al editar: solo se ofrece el propio piloto.
  const employeeOptions = useMemo(() => {
    const employee = (employees ?? []).find(
      (e) => e.dni === pilot.employee_dni,
    );
    const name = employee
      ? `${employee.first_name} ${employee.last_name} (${employee.dni_type}-${employee.dni})`
      : `${pilot.employee?.first_name ?? ""} ${pilot.employee?.last_name ?? ""} (${pilot.employee_dni})`.trim();

    return [{ id: pilot.employee_dni, name }];
  }, [employees, pilot]);

  const onSubmit = async (values: PilotFormValues) => {
    const changes = diffPilot(pilot, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updatePilot.mutateAsync({
        company: selectedCompany!.slug,
        id: pilot.id.toString(),
        data: changes,
      });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, PILOT_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updatePilot.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(PILOT_FIELD_LABELS),
          )(e);
        }}
      >
        <PilotFormFields
          control={form.control}
          disabled={updatePilot.isPending}
          employeeOptions={employeeOptions}
          employeesLoading={employeesLoading}
          employeeLocked
        />
      </ArticleFormShell>
    </Form>
  );
}
