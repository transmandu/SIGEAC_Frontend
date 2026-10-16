"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreatePilot } from "@/actions/ajustes/piloto/actions";
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
import { PilotFormFields } from "./PilotFormFields";
import {
  buildPilotSchema,
  PILOT_FIELD_LABELS,
  type PilotFormValues,
} from "./pilotSchema";

interface FormProps {
  onClose: () => void;
}

export function CreatePilotForm({ onClose }: FormProps) {
  const { selectedCompany } = useCompanyStore();
  const { createPilot } = useCreatePilot();
  const { data: employees, isLoading: employeesLoading } =
    useGetEmployeesByCompany(selectedCompany?.slug);
  const { data: pilots, isSuccess: pilotsLoaded } = useGetPilots(
    selectedCompany?.slug,
  );

  const schema = useMemo(() => buildPilotSchema(pilots), [pilots]);

  const form = useForm<PilotFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employee_dni: "", license_number: "" },
  });

  // Quien ya es piloto no se ofrece de nuevo.
  const employeeOptions = useMemo(() => {
    const taken = new Set((pilots ?? []).map((pilot) => pilot.employee_dni));

    return (employees ?? [])
      .filter((employee) => !taken.has(employee.dni))
      .map((employee) => ({
        id: employee.dni,
        name: `${employee.first_name} ${employee.last_name} (${employee.dni_type}-${employee.dni})`,
      }));
  }, [employees, pilots]);

  // La licencia se valida contra los pilotos: si estos llegan después de que el
  // usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (pilotsLoaded && form.formState.dirtyFields.license_number) {
      form.trigger("license_number");
    }
  }, [pilotsLoaded, pilots, form]);

  const onSubmit = async (values: PilotFormValues) => {
    try {
      await createPilot.mutateAsync({
        company: selectedCompany!.slug,
        data: values,
      });
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, PILOT_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createPilot.isPending}
        canSave
        submitLabel="Registrar piloto"
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
          disabled={createPilot.isPending}
          employeeOptions={employeeOptions}
          employeesLoading={employeesLoading}
        />
      </ArticleFormShell>
    </Form>
  );
}
