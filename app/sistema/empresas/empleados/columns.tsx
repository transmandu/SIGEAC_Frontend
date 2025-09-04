"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Employee } from "@/types"

export const columns: ColumnDef<Employee>[] = [
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
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <>
        <span className='flex justify-center font-bold'>{row.original.first_name}</span>
      </>
  },
    {
    accessorKey: "last_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <>
        <span className='flex justify-center font-bold'>{row.original.last_name}</span>
      </>
  },
  {
    accessorKey: "dni",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cedula" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center font-semibold italic text-muted-foreground">{row.original.dni_type}-{row.original.dni}</span>

      </>
  },
]
