"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Manufacturer, Vendor } from "@/types"

export const columns: ColumnDef<Vendor>[] = [
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
    meta: { title: 'Nombre' },
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='font-bold text-center'>{row.original.name ?? "N/A"}</span>
      </div>
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Email" />
    ),
    meta: { title: 'Email' },
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='text-muted-foreground italic'>{row.original.email}</span>
      </div>
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. TLF" />
    ),
    meta: { title: 'Nro. TLF' },
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='text-muted-foreground italic'>{row.original.email}</span>
      </div>
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ubicacion" />
    ),
    meta: { title: 'Ubicacion' },
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='text-muted-foreground italic'>{row.original.address}</span>
      </div>
  },
]
