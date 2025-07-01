"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import WarehouseDropdownActions from "@/components/dropdowns/ajustes/WarehouseDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import { Condition, Warehouse } from "@/types"

export const columns: ColumnDef<Condition>[] = [
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
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <>
        <span className='font-bold flex justify-center'>{row.original.name ?? "N/A"}</span>
      </>
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion" />
    ),
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.description}</span>
      </>
  },
  {
    accessorKey: "registered_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registrado" />
    ),
    cell: ({ row }) =>
      <>
        <span className="flex justify-center">{row.original.registered_by}</span>
      </>
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <WarehouseDropdownActions id={id.toString()} />
      )
    },
  },
]
