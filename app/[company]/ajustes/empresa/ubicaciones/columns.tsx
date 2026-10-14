"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import { Location } from "@/types";

export const columns: AppColumnDef<Location>[] = [
  {
    accessorKey: "name",
    size: 240,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center items-center gap-2 w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name ?? "—"}
        </span>
        {row.original.isMainBase && (
          <TagBadge tone="blue">Base principal</TagBadge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "address",
    size: 360,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Ubicación" />
      </div>
    ),
    meta: { title: "Ubicación" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.address || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "cod_iata",
    size: 140,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cód. IATA" />
      </div>
    ),
    meta: { title: "Cód. IATA" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.cod_iata || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Tipo" />
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
];
