"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import WarehouseDropdownActions from "@/components/dropdowns/ajustes/WarehouseDropdownActions";
import { Warehouse } from "@/types";

export const columns: AppColumnDef<Warehouse>[] = [
  {
    accessorKey: "name",
    size: 220,
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
    id: "location",
    size: 320,
    accessorFn: (warehouse) =>
      `${warehouse.location?.address ?? ""} ${warehouse.location?.type ?? ""}`.trim(),
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Ubicación" />
      </div>
    ),
    meta: { title: "Ubicación" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.location
            ? `${row.original.location.address} - ${row.original.location.type}`
            : "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "company",
    size: 200,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Empresa" />
      </div>
    ),
    meta: { title: "Empresa" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.company}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.type ? (
          <TagBadge tone="slate">{row.original.type}</TagBadge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
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
        <WarehouseDropdownActions warehouse={row.original} />
      </div>
    ),
  },
];
