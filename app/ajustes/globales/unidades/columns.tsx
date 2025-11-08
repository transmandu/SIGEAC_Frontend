"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Unit } from "@/types"
import UnitDropdownActions from "@/components/dropdowns/ajustes/UnitDropdownActions"

export const columns: ColumnDef<Unit>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.label}</span>
        <span className="font-light text-center ml-1">({row.original.value})</span>
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <UnitDropdownActions id={row.original.id} />
      </div>
    ),
  },
];
