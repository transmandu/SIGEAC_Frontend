"use client";

import ConditionDropdownActions from "@/components/dropdowns/ajustes/ConditionDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { type AppColumnDef } from "@/lib/table";
import { Condition } from "@/types";

export const columns: AppColumnDef<Condition>[] = [
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
    accessorKey: "description",
    size: 360,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Descripción" />
      </div>
    ),

    meta: { title: "Descripción" },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-muted-foreground text-center">
          {row.original.description || "—"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "excluded_from_cost",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="En reportes de costo" />
      </div>
    ),

    meta: { title: "En reportes de costo" },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.excluded_from_cost ? (
          <Badge className="rounded-md border border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300">
            No suma al costo
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Suma al costo</span>
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
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <ConditionDropdownActions condition={row.original} />
      </div>
    ),
  },
];
