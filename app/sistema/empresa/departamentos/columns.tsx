"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Department } from "@/types"
import DepartmentDropdownActions from "@/components/dropdowns/general/DepartmentDropdownActions"

export const columns: ColumnDef<Department>[] = [
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
    accessorKey: "dni",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center">{row.original.name}</span>
      </>
  },
    {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Acronimo" />
    ),
    cell: ({ row }) =>
      <>
        <span className='flex justify-center font-bold'>{row.original.acronym}</span>
      </>
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Correo" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center font-medium">{row.original.email}</span>
      </>
  },
    {
      id: 'actions',
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader
            column={column}
            title="Acciones"
          />
        </div>
      ),
  
      meta: {
        title: 'Acciones',
      },
  
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <DepartmentDropdownActions department={row.original} />
        </div>
      ),
    },
]
