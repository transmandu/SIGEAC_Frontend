"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCreateAuthorizedEmployee } from "@/hooks/sistema/autorizados/useCreateAuthorizedEmployee";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  dni_employee: z.string().min(1, "Seleccione un empleado"),
  to_company_db: z.string().min(1, "Seleccione una empresa destino"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSuccess?: () => void;
}

export function AuthorizedEmployeeForm({ onSuccess }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const { mutateAsync, isPending } = useCreateAuthorizedEmployee();

  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");
  const { data: departmentEmployees = [], isPending: deptLoading } =
    useGetUserDepartamentEmployees(!isSuperUser ? selectedCompany?.slug : undefined);

  const { data: allEmployees = [], isLoading: allEmployeesLoading } =
    useGetEmployeesByCompany(isSuperUser ? selectedCompany?.slug : undefined);

  const { data: companies = [], isLoading: isLoadingCompanies } =
    useGetCompanies();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedEmployee = watch("dni_employee");
  const toCompany = watch("to_company_db");

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany?.slug) return;

    await mutateAsync({
      dni_employee: values.dni_employee,
      from_company_db: selectedCompany.slug,
      to_company_db: values.to_company_db,
    });

    reset();
    onSuccess?.();
  };

  const employees = isSuperUser ? allEmployees : departmentEmployees;
  const isLoading = isSuperUser ? allEmployeesLoading : deptLoading;

  const filteredCompanies = useMemo(
    () =>
      companies.filter((company) => company.slug !== selectedCompany?.slug),
    [companies, selectedCompany?.slug]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Empleado */}
      <div className="space-y-2">
        <Label>Empleado</Label>

        <Select
          value={selectedEmployee}
          onValueChange={(value) => setValue("dni_employee", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione empleado" />
          </SelectTrigger>

          <SelectContent>
            {isLoading && (
              <SelectItem value="loading" disabled>
                Cargando empleados...
              </SelectItem>
            )}

            {!isLoading && employees.length === 0 && (
              <SelectItem value="empty" disabled>
                No hay empleados disponibles
              </SelectItem>
            )}

            {employees.map((emp) => (
              <SelectItem key={emp.dni} value={emp.dni}>
                <div className="flex flex-col">
                  <span>
                    {emp.first_name} {emp.last_name} – {emp.dni}
                  </span>
                  {(emp.job_title?.name || emp.department?.name) && (
                    <span className="text-sm text-muted-foreground">
                      {emp.job_title?.name ?? "–"} – {emp.department?.name ?? "–"}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.dni_employee && (
          <p className="text-sm text-destructive">{errors.dni_employee.message}</p>
        )}
      </div>

      {/* Empresa Origen */}
      <div className="space-y-2">
        <Label>Empresa Origen</Label>
        <Input
          disabled
          value={selectedCompany?.slug ?? ""}
          className="uppercase"
        />
      </div>

      {/* Empresa Destino */}
      <div className="space-y-2">
        <Label>Empresa Destino</Label>

        <Select
          value={toCompany}
          onValueChange={(value) => setValue("to_company_db", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione empresa destino" />
          </SelectTrigger>

          <SelectContent>
            {isLoadingCompanies && (
              <SelectItem value="loading" disabled>
                Cargando empresas...
              </SelectItem>
            )}

            {!isLoadingCompanies && filteredCompanies.length === 0 && (
              <SelectItem value="empty" disabled>
                No hay empresas disponibles
              </SelectItem>
            )}

            {filteredCompanies.map((company) => (
              <SelectItem key={company.id} value={company.slug}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.to_company_db && (
          <p className="text-sm text-destructive">{errors.to_company_db.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Guardar autorización"}
      </Button>
    </form>
  );
}