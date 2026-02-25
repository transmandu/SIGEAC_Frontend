"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Checkbox } from "@/components/ui/checkbox";

export interface AuthorizedEmployee {
  id: number;
  dni_employee: string;
  from_company_db: string; // Empresa que autorizó
  to_company_db: string;   // Empresa actual (no se muestra)
  employee_name: string;
  job_title?: string;      // Cargo del empleado
  department?: string;     // Departamento del empleado
}

export const columns: ColumnDef<AuthorizedEmployee>[] = [
  // 🔹 Selección
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 🔹 DNI
  {
    accessorKey: "dni_employee",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="DNI" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center font-medium">
        V-{row.original.dni_employee}
      </span>
    ),
  },

  // 🔹 Nombre completo
  {
    accessorKey: "employee_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center font-semibold">
        {row.original.employee_name}
      </span>
    ),
  },

  // 🔹 Cargo (job_title)
  {
    accessorKey: "job_title",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cargo" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center font-medium">
        {row.original.job_title ?? "-"}
      </span>
    ),
  },

  // 🔹 Departamento
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Departamento" />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center font-medium">
        {row.original.department ?? "-"}
      </span>
    ),
  },

  // 🔹 Empresa de ORIGEN (quien autorizó)
  {
    accessorKey: "from_company_db",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Empresa que Autoriza"
      />
    ),
    cell: ({ row }) => (
      <span className="flex justify-center uppercase text-muted-foreground">
        {row.original.from_company_db}
      </span>
    ),
  },
];