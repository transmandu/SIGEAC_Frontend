"use client";

import { Loader2 } from "lucide-react";
import { useGetSmsTrainingGroupEmployees } from "@/hooks/curso/useGetSmsTrainingGroupEmployees";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SmsTrainingGroup } from "@/types";

export function SmsTrainingGroupEmployees({
  group,
}: {
  group: SmsTrainingGroup;
}) {
  const { selectedCompany } = useCompanyStore();
  const {
    data: employees,
    isLoading,
    isError,
  } = useGetSmsTrainingGroupEmployees(selectedCompany?.slug, group.id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando empleados del grupo...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        No se pudieron cargar los empleados del grupo.
      </p>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay empleados activos con los cargos de este grupo.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Empleados activos del grupo ({employees.length})
      </p>

      <div className="overflow-hidden rounded-md border bg-background">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 border-b bg-muted/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Nombre</span>
          <span>Cédula</span>
          <span>Cargo</span>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {employees.map((employee) => (
            <div
              key={employee.dni}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 border-b px-3 py-2 text-sm last:border-b-0"
            >
              <span className="font-medium">
                {employee.first_name} {employee.last_name}
              </span>
              <span className="text-muted-foreground">{employee.dni}</span>
              <span className="text-muted-foreground">
                {employee.job_title?.name ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
