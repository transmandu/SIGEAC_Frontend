"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCreateAuthorizedEmployee } from "@/hooks/sistema/autorizados/useCreateAuthorizedEmployee";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { useGetAuthorizedEmployeesFromCompany } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployeesFromCompany";

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
  const { mutateAsync, isPending } = useCreateAuthorizedEmployee();

  const { data: employees = [], isLoading } =
    useGetEmployeesByCompany(selectedCompany?.slug);

  const { data: companies = [], isLoading: isLoadingCompanies } =
    useGetCompanies();

  const { data: authorizedEmployees = [] } =
    useGetAuthorizedEmployeesFromCompany(selectedCompany?.slug);

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

  // Filtrar para que NO aparezca la empresa origen
  const filteredCompanies = companies.filter(
    (company) => company.slug !== selectedCompany?.slug
  );

  // DNIs ya autorizados a la empresa destino seleccionada
  const authorizedDnisForDestination = new Set(
    authorizedEmployees
      .filter((auth) => auth.to_company_db === toCompany)
      .map((auth) => auth.dni_employee)
  );

  // Empleados disponibles: ocultar los que ya están autorizados al destino seleccionado
  const availableEmployees = toCompany
    ? employees.filter((emp) => !authorizedDnisForDestination.has(emp.dni))
    : employees;

  // Si el empleado seleccionado queda oculto al cambiar el destino, limpiar la selección
  useEffect(() => {
    if (selectedEmployee && authorizedDnisForDestination.has(selectedEmployee)) {
      setValue("dni_employee", "");
    }
  }, [selectedEmployee, toCompany, authorizedDnisForDestination, setValue]);

  const hasDestination = Boolean(toCompany);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Empresa Origen (contexto: empresa que autoriza) */}
      <div className="space-y-1.5">
        <Label className="text-muted-foreground">Empresa Origen</Label>
        <Input
          readOnly
          tabIndex={-1}
          value={selectedCompany?.name ?? selectedCompany?.slug ?? ""}
          className="bg-muted/50 cursor-default focus-visible:ring-0"
        />
        <p className="text-xs text-muted-foreground">
          Empresa que otorga la autorización.
        </p>
      </div>

      {/* Empresa Destino (decisión que filtra los empleados disponibles) */}
      <div className="space-y-1.5">
        <Label>
          Empresa Destino <span className="text-destructive">*</span>
        </Label>

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
          <p className="text-sm text-destructive">
            {errors.to_company_db.message}
          </p>
        )}
      </div>

      {/* Empleado (habilitado tras elegir destino; oculta los ya autorizados) */}
      <div className="space-y-1.5">
        <Label className={!hasDestination ? "text-muted-foreground" : undefined}>
          Empleado <span className="text-destructive">*</span>
        </Label>

        <Select
          value={selectedEmployee}
          onValueChange={(value) => setValue("dni_employee", value)}
          disabled={!hasDestination}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                hasDestination
                  ? "Seleccione empleado"
                  : "Primero elija la empresa destino"
              }
            />
          </SelectTrigger>

          <SelectContent>
            {isLoading && (
              <SelectItem value="loading" disabled>
                Cargando empleados...
              </SelectItem>
            )}

            {!isLoading && availableEmployees.length === 0 && (
              <SelectItem value="empty" disabled>
                Todos los empleados ya están autorizados a esta empresa
              </SelectItem>
            )}

            {availableEmployees.map((emp) => (
              <SelectItem key={emp.dni} value={emp.dni}>
                <div className="flex flex-col">
                  <span>
                    {emp.first_name} {emp.last_name} – {emp.dni}
                  </span>
                  {(emp.job_title?.name || emp.department?.name) && (
                    <span className="text-sm text-muted-foreground">
                      {emp.job_title?.name ?? "–"} –{" "}
                      {emp.department?.name ?? "–"}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          {hasDestination
            ? "Los empleados ya autorizados a esta empresa no aparecen en la lista."
            : "Seleccione la empresa destino para ver los empleados disponibles."}
        </p>

        {errors.dni_employee && (
          <p className="text-sm text-destructive">
            {errors.dni_employee.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Guardar autorización"}
      </Button>
    </form>
  );
}