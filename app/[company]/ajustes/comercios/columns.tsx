"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { RetailerDropdownActions } from "@/components/dropdowns/general/RetailerDropdownActions";
import { Retailer } from "@/types";

export const columns: AppColumnDef<Retailer>[] = [
  {
    accessorKey: "name",
    size: 280,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Nro. TLF" />
      </div>
    ),
    meta: { title: "Nro. TLF" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.phone || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "address",
    size: 360,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Ubicación" />
      </div>
    ),
    meta: { title: "Ubicación" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="block max-w-95 text-sm text-slate-600 dark:text-slate-300 text-center whitespace-normal wrap-break-word leading-snug">
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
        <RetailerDropdownActions retailer={row.original} />
      </div>
    ),
  },
];
