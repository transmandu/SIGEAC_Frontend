"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

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
  {
    accessorKey: "dni_employee",
    size: 140,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="DNI" />
      </div>
    ),

    meta: {
      title: "DNI",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          V-{row.original.dni_employee}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "employee_name",
    size: 240,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),

    meta: {
      title: "Nombre",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.employee_name}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "job_title",
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Cargo" />
      </div>
    ),

    meta: {
      title: "Cargo",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.job_title ?? "—"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "department",
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Departamento" />
      </div>
    ),

    meta: {
      title: "Departamento",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.department ?? "—"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "from_company_db",
    size: 220,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Empresa que Autoriza" />
      </div>
    ),

    meta: {
      title: "Empresa que Autoriza",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 uppercase">
          {row.original.from_company_db}
        </span>
      </div>
    ),
  },
];
