"use client"

import WarehouseDropdownActions from "@/components/dropdowns/ajustes/WarehouseDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Card>[] = [
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
      <DataTableColumnHeader filter column={column} title="Nro. de Tarjeta" />
    ),
    meta: { title: 'Nro. de Tarjeta' },
    cell: ({ row }) =>
      <>
        <span className='font-bold flex justify-center'>****-******-****-{row.original.card_number}</span>
      </>
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Tarjeta" />
    ),
    meta: { title: 'Tipo de Tarjeta' },
    cell: ({ row }) =>
      <>
        <span className='font-medium flex justify-center italic'>{row.original.type}</span>
      </>
  },
  {
    accessorKey: "bank",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banco" />
    ),
    meta: { title: 'Banco' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.bank_account.bank.name}</span>
      </>
  },
  {
    accessorKey: "bank_account",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    meta: { title: 'Cuenta' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>******-*******-****-{row.original.bank_account.account_number}</span>
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
