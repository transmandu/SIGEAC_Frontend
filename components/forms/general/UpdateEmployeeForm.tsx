"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";

import { useUpdateEmployee } from "@/actions/ajustes/empleados/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { hintClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetInactiveEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetInactiveEmployees";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useGetUsers } from "@/hooks/sistema/usuario/useGetUsers";
import { flattenDepartments } from "@/lib/departments";
import { locationLabel } from "@/lib/locations";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Employee } from "@/types";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { EmployeeUserPicker, type UserOption } from "./EmployeeUserPicker";
import {
  buildEmployeeSchema,
  diffEmployee,
  EMPLOYEE_FIELD_LABELS,
  employeeToValues,
  type EmployeeFormValues,
} from "./employeeSchema";

export function UpdateEmployeeForm({
  employee,
  onSuccess,
}: {
  employee: Employee;
  onSuccess?: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const isSuperuser = useIsSuperuser();
  const updateEmployee = useUpdateEmployee();

  const slug = selectedCompany?.slug;
  const { data: locations, isLoading: loadingLocations } =
    useGetLocationsByCompany(slug);
  const { data: departments, isLoading: loadingDepartments } =
    useGetDepartments(slug);
  const { data: jobTitles, isLoading: loadingJobTitles } =
    useGetJobTitles(slug);
  const { data: activeEmployees } = useGetEmployeesByCompany(slug);
  const { data: inactiveEmployees } = useGetInactiveEmployeesByCompany(slug);
  // `/users` es solo de SUPERUSER: para los demás no se pide ni se ofrece.
  const { data: users, isLoading: loadingUsers } = useGetUsers({
    enabled: isSuperuser,
  });

  const schema = useMemo(
    () =>
      buildEmployeeSchema({
        employees: [...(activeEmployees ?? []), ...(inactiveEmployees ?? [])],
        current: employee,
      }),
    [activeEmployees, inactiveEmployees, employee],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que se está escribiendo.
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: employeeToValues(employee),
  });

  const userOptions = useMemo<UserOption[]>(() => {
    const currentId = employee.user_id ? String(employee.user_id) : null;

    const options: UserOption[] = (users ?? [])
      .filter(
        (user) =>
          String(user.id) === currentId ||
          !user.employee ||
          user.employee.length === 0,
      )
      .map((user) => ({
        id: String(user.id),
        label: user.username,
        detail: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      }));

    // La lista de usuarios puede no incluir al vinculado: no se pierde.
    if (
      currentId &&
      employee.user &&
      !options.some((o) => o.id === currentId)
    ) {
      options.unshift({ id: currentId, label: employee.user.username });
    }

    return options;
  }, [users, employee.user_id, employee.user]);

  const onSubmit = async (values: EmployeeFormValues) => {
    if (!slug) return;

    const data = diffEmployee(employee, values);

    if (!data) {
      onSuccess?.();
      return;
    }

    try {
      await updateEmployee.mutateAsync({
        company: slug,
        id: Number(employee.id),
        data,
      });
      onSuccess?.();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, EMPLOYEE_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateEmployee.isPending}
        canSave={form.formState.isDirty}
        onCancel={onSuccess}
        onSubmit={(event) => {
          event.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(EMPLOYEE_FIELD_LABELS),
          )(event);
        }}
      >
        <EmployeeFormFields
          control={form.control}
          disabled={updateEmployee.isPending}
          isEditing
          existingPhotoUrl={employee.photo_url_lg || employee.photo_url}
          jobTitles={(jobTitles ?? []).map((title) => ({
            id: String(title.id),
            label: title.name,
          }))}
          departments={flattenDepartments(departments ?? []).map(
            (department) => ({
              id: String(department.id),
              label: department.name,
            }),
          )}
          locations={(locations ?? []).map((location) => ({
            id: String(location.id),
            label: locationLabel(location),
          }))}
          loading={{
            jobTitles: loadingJobTitles,
            departments: loadingDepartments,
            locations: loadingLocations,
          }}
        />

        {isSuperuser && (
          <PanelSection
            icon={KeyRound}
            title="Acceso al sistema"
            hint="El usuario con el que la persona inicia sesión."
          >
            <FormField
              control={form.control}
              name="user_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel preventClick>
                    Usuario vinculado
                  </PanelFieldLabel>
                  <EmployeeUserPicker
                    value={field.value}
                    onChange={field.onChange}
                    options={userOptions}
                    loading={loadingUsers}
                    disabled={updateEmployee.isPending}
                    invalid={!!fieldState.error}
                  />
                  <FormDescription className={hintClass}>
                    Sin usuario, la persona no puede iniciar sesión. Solo
                    aparecen los usuarios que aún no son de ningún empleado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </PanelSection>
        )}
      </ArticleFormShell>
    </Form>
  );
}
