"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import AuthorizedEmployeeDropdownActions from "@/components/dropdowns/ajustes/AuthorizedEmployeeDropdownActions";

export interface AuthorizedEmployee {
  id: number;
  dni_employee: string;
  from_company_db: string; // empresa que autoriza
  to_company_db: string;   // empresa autorizada
  employee_name: string;
}

export const columns: ColumnDef<AuthorizedEmployee>[] = [
  {
    accessorKey: "dni_employee",
    size: 160,

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
    size: 260,

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
    accessorKey: "to_company_db",
    size: 220,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Empresa a Autorizar" />
      </div>
    ),

    meta: {
      title: "Empresa a Autorizar",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 uppercase">
          {row.original.to_company_db}
        </span>
      </div>
    ),
  },

  {
    id: "actions",
    size: 100,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),

    meta: {
      title: "Acciones",
    },

    cell: ({ row }) => (
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <AuthorizedEmployeeDropdownActions authorizedEmployee={row.original} />
      </div>
    ),
  },
];
