"use client";

import { Employee } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  employee: Employee;
}

const Item = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-md border bg-muted/20 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  );
};

export function EmployeeExpandedRow({ employee }: Props) {
  return (
    <div className="px-6 py-4">
      {/* HEADER CONTEXTUAL */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold">
          Información del empleado
        </div>

        <div className="text-xs text-muted-foreground">
          Datos adicionales
        </div>
      </div>

      {/* GRID MEJORADO */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

        <Item label="Tipo de sangre" value={employee.blood_type} />

        <Item
          label="Fecha nacimiento"
          value={
            employee.birth_date
              ? new Intl.DateTimeFormat("es-ES").format(
                  new Date(employee.birth_date)
                )
              : "—"
          }
        />

        <Item label="Email" value={employee.email} />

        <Item label="Teléfono" value={employee.phone} />

        <Item label="Dirección" value={employee.address} />

        <Item label="Ubicación" value={employee.location?.name} />

        <Item label="Cargo" value={employee.job_title?.name} />

        <Item label="Departamento" value={employee.department?.name} />

        <Item label="Usuario" value={employee.user?.username} />
      </div>
    </div>
  );
}