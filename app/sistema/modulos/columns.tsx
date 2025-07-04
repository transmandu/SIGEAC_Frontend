"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Module } from "@/types"

export const columns: ColumnDef<Module>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Etiqueta" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center font-bol">{row.original.label}</span>
      </>
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Valor" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center font-bol">{row.original.value}</span>
      </>
  }
]
