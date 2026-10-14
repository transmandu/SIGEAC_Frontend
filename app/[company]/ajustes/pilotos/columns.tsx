"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import PilotDropdownActions from "@/components/misc/PilotDropdownActions";
import { Pilot } from "@/types";

export const columns: AppColumnDef<Pilot>[] = [
  {
    accessorKey: "employee_dni",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Cédula" />
      </div>
    ),
    meta: { title: "Cédula" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {row.original.employee_dni}
        </span>
      </div>
    ),
  },
  {
    id: "name",
    size: 280,
    accessorFn: (pilot) =>
      `${pilot.employee?.first_name ?? ""} ${pilot.employee?.last_name ?? ""}`.trim(),
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.employee?.first_name} {row.original.employee?.last_name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "license_number",
    size: 200,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Nro. de Licencia" />
      </div>
    ),
    meta: { title: "Nro. de Licencia" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.license_number || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "phone",
    size: 160,
    accessorFn: (pilot) => pilot.employee?.phone ?? "",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Teléfono" />
      </div>
    ),
    meta: { title: "Teléfono" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.employee?.phone || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "email",
    size: 240,
    accessorFn: (pilot) => pilot.employee?.email ?? "",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Correo" />
      </div>
    ),
    meta: { title: "Correo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.employee?.email || "—"}
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
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <PilotDropdownActions pilot={row.original} />
      </div>
    ),
  },
];
