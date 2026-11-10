"use client";

import { useMemo } from "react";
import { type Control, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  useCreateEmployee,
  useLinkEmployeeUser,
} from "@/actions/ajustes/empleados/actions";
import {
  useAddModulesToUser,
  useCreateUser,
} from "@/actions/sistema/usuarios/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetInactiveEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetInactiveEmployees";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { flattenDepartments } from "@/lib/departments";
import { locationLabel } from "@/lib/locations";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { EmployeeAccessPanel } from "./EmployeeAccessPanel";
import { EmployeeFormFields } from "./EmployeeFormFields";
import {
  buildCreateEmployeeSchema,
  EMPLOYEE_FIELD_LABELS,
  type CreateEmployeeFormValues,
  type EmployeeFormValues,
} from "./employeeSchema";

/** El id del usuario recién creado, según la forma en que responda la API. */
const resolveCreatedUserId = (response: unknown): string | undefined => {
  const r = response as {
    data?: { user?: { id?: string | number }; id?: string | number };
    user?: { id?: string | number };
    id?: string | number;
  };
  const id = r?.data?.user?.id ?? r?.user?.id ?? r?.data?.id ?? r?.id;

  return id !== undefined && id !== null ? String(id) : undefined;
};

const optional = (value: string) => value.trim() || undefined;

export function CreateEmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const { selectedCompany } = useCompanyStore();
  const isSuperuser = useIsSuperuser();

  const createEmployee = useCreateEmployee();
  const linkUser = useLinkEmployeeUser();
  const { createUser } = useCreateUser();
  const { addModules } = useAddModulesToUser();

  const slug = selectedCompany?.slug;
  const { data: locations, isLoading: loadingLocations } =
    useGetLocationsByCompany(slug);
  const { data: departments, isLoading: loadingDepartments } =
    useGetDepartments(slug);
  const { data: jobTitles, isLoading: loadingJobTitles } =
    useGetJobTitles(slug);
  const { data: activeEmployees } = useGetEmployeesByCompany(slug);
  const { data: inactiveEmployees } = useGetInactiveEmployeesByCompany(slug);

  const schema = useMemo(
    () =>
      buildCreateEmployeeSchema({
        employees: [...(activeEmployees ?? []), ...(inactiveEmployees ?? [])],
      }),
    [activeEmployees, inactiveEmployees],
  );

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      second_last_name: "",
      dni_type: "V",
      dni: "",
      blood_type: "",
      birth_date: "",
      email: "",
      phone: "",
      address: "",
      start_date: "",
      job_title_id: "",
      department_id: "",
      location_id: "",
      user_id: "",
      remove_photo: false,
      access: "none",
      new_user: {
        username: "",
        password: "",
        email: "",
        company_id: "",
        location_ids: [],
        role_ids: [],
        module_ids: [],
      },
    },
  });

  const busy =
    createEmployee.isPending ||
    createUser.isPending ||
    addModules.isPending ||
    linkUser.isPending;

  const onSubmit = async (values: CreateEmployeeFormValues) => {
    if (!slug) return;

    let employeeId: number;

    try {
      const employee = await createEmployee.mutateAsync({
        first_name: values.first_name,
        middle_name: optional(values.middle_name),
        last_name: values.last_name,
        second_last_name: optional(values.second_last_name),
        dni: values.dni,
        dni_type: values.dni_type,
        blood_type: optional(values.blood_type),
        gender: values.gender,
        birth_date: optional(values.birth_date),
        email: optional(values.email),
        phone: optional(values.phone),
        address: optional(values.address),
        start_date: optional(values.start_date),
        job_title_id: values.job_title_id,
        department_id: values.department_id,
        location_id: values.location_id,
        user_id: values.access === "existing" ? values.user_id : undefined,
        company: slug,
        profile_photo: values.profile_photo,
      });
      employeeId = employee.id;
    } catch (error) {
      // El aviso lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, EMPLOYEE_FIELD_LABELS);
      }
      return;
    }

    // El usuario se crea DESPUÉS del empleado: si falla, la persona ya está
    // registrada y se le puede vincular uno luego. Al revés, un empleado que
    // no se pudiera crear dejaba un usuario huérfano.
    if (values.access === "new") {
      const { new_user: user } = values;

      try {
        const created = await createUser.mutateAsync({
          isActive: true,
          first_name: values.first_name,
          last_name: values.last_name,
          username: user.username,
          password: user.password,
          email: user.email,
          roles: user.role_ids.map(Number),
          companies_locations: [
            {
              companyID: Number(user.company_id),
              locationID: user.location_ids,
            },
          ],
        } as never);

        const userId = resolveCreatedUserId(created);
        if (!userId) throw new Error("La API no devolvió el usuario creado.");

        if (user.module_ids.length > 0) {
          await addModules.mutateAsync({
            userId,
            companyId: Number(user.company_id),
            moduleIds: user.module_ids,
          });
        }

        await linkUser.mutateAsync({ company: slug, id: employeeId, userId });
      } catch {
        // El motivo ya lo mostró la mutación que falló.
        toast.warning("El empleado se registró, pero sin usuario", {
          description:
            "No se pudo crear o vincular la cuenta. Puede hacerlo después editando al empleado.",
        });
      }
    }

    onSuccess?.();
  };

  const jobTitleOptions = (jobTitles ?? []).map((title) => ({
    id: String(title.id),
    label: title.name,
  }));
  const departmentOptions = flattenDepartments(departments ?? []).map(
    (department) => ({ id: String(department.id), label: department.name }),
  );
  const locationOptions = (locations ?? []).map((location) => ({
    id: String(location.id),
    label: locationLabel(location),
  }));

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={busy}
        canSave
        submitLabel="Crear empleado"
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
          control={form.control as unknown as Control<EmployeeFormValues>}
          disabled={busy}
          jobTitles={jobTitleOptions}
          departments={departmentOptions}
          locations={locationOptions}
          loading={{
            jobTitles: loadingJobTitles,
            departments: loadingDepartments,
            locations: loadingLocations,
          }}
        />

        {isSuperuser && (
          <EmployeeAccessPanel control={form.control} disabled={busy} />
        )}
      </ArticleFormShell>
    </Form>
  );
}
