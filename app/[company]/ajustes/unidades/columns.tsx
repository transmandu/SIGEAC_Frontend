"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Unit } from "@/types";
import UnitDropdownActions from "@/components/dropdowns/ajustes/UnitDropdownActions";
import { TagBadge } from "@/components/misc/TagBadge";
import { Ruler } from "lucide-react";

export const columns: AppColumnDef<Unit>[] = [
  {
    accessorKey: "label",
    size: 320,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Unidad" />
      </div>
    ),
    meta: { title: "Unidad" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.label}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">
          ({row.original.value})
        </span>
      </div>
    ),
  },
  {
    accessorKey: "is_dimensional",
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Medidas" />
      </div>
    ),
    meta: { title: "Medidas" },
    // Solo se marca lo habilitado: un badge en cada fila normal sería ruido,
    // porque la mayoría de las unidades nunca sirven para dimensionar.
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.is_dimensional ? (
          <TagBadge tone="blue" icon={Ruler}>
            Declara medidas
          </TagBadge>
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
        <UnitDropdownActions unit={row.original} />
      </div>
    ),
  },
];
