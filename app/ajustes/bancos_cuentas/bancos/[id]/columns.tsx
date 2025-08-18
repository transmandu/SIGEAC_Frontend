"use client"

import WarehouseDropdownActions from "@/components/dropdowns/ajustes/WarehouseDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { BankAccount } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns: ColumnDef<BankAccount>[] = [
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
      <>
        <Link href={`/ajustes/bancos_cuentas/cuentas/${row.original.account_number}`} className='font-bold flex justify-center'>{row.original.name ?? "N/A"}</Link>
      </>
  },
  {
    accessorKey: "account_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Cuenta" />
    ),
    meta: { title: 'Tipo de Banco' },
    cell: ({ row }) =>
      <>
        <span className='font-medium flex justify-center italic'>***-******-*****-{row.original.account_number}</span>
      </>
  },
  {
    accessorKey: "bank",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banco" />
    ),
    meta: { title: 'Tipo de Banco' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.bank.name}</span>
      </>
  },
  {
    accessorKey: "account_owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    meta: { title: 'Tipo de Banco' },
    cell: ({ row }) =>
      <>
        <span className='font-bold flex justify-center italic'>{row.original.account_owner}</span>
      </>
  },
  {
    accessorKey: "account_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Cuenta" />
    ),
    meta: { title: 'Tipo de Banco' },
    cell: ({ row }) =>
      <>
        <span className='font-bold flex justify-center italic'>{row.original.account_type}</span>
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
