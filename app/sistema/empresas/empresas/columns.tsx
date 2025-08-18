"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Company } from "@/types"

export const columns: ColumnDef<Company>[] = [
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
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center font-bold">{row.original.name}</span>
      </>
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="RIF" />
    ),
    cell: ({ row }) =>
      <span className="flex justify-center italic text-muted-foreground">{row.original.rif}</span>
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cod. INAC" />
    ),
    cell: ({ row }) =>
      <span className="flex justify-center font-semibold text-muted-foreground">{row.original.cod_inac}</span>
  },
    {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de TLF" />
    ),
    cell: ({ row }) =>
      <span className="flex justify-center text-muted-foreground">{row.original.phone_number}</span>
  },
    {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ubicación" />
    ),
    cell: ({ row }) =>
      <span className="flex justify-center font-semibold">{row.original.fiscal_address}</span>
  },
]
