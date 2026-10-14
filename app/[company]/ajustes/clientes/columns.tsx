"use client";

import { type AppColumnDef } from "@/lib/table";
import { Client } from "@/types";
import ClientDropdownActions from "@/components/dropdowns/general/ClientDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

export const columns: AppColumnDef<Client>[] = [
  {
    accessorKey: "name",
    size: 260,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "dni",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="RIF / C.I" />
      </div>
    ),
    meta: { title: "RIF / C.I" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {row.original.dni_type}-{row.original.dni}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Nro. TLF" />
      </div>
    ),
    meta: { title: "Nro. TLF" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.phone || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "address",
    size: 340,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Ubicación" />
      </div>
    ),
    meta: { title: "Ubicación" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="block max-w-85 text-sm text-slate-600 dark:text-slate-300 text-center whitespace-normal wrap-break-word leading-snug">
          {row.original.address || "—"}
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
        <ClientDropdownActions client={row.original} />
      </div>
    ),
  },
];
