"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import ManufacturerDropdownActions from "@/components/misc/ManufacturerDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import { Manufacturer } from "@/types"

export const columns: ColumnDef<Manufacturer>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Abrev." />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='font-bold text-center'>{row.original.name ?? "N/A"}</span>
      </div>
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='text-muted-foreground italic'>{row.original.description.toUpperCase()}</span>
      </div>
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <ManufacturerDropdownActions id={id.toString()} />
      )
    },
  },
]
