"use client"

import { BankDropdownActions } from "@/components/dropdowns/ajustes/BancosPagosDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Bank } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns: ColumnDef<Bank>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: 'Nombre' },
    cell: ({ row }) =>
      <>
        <Link href={`/ajustes/banca/bancos/${row.original.id}`} className='font-bold flex justify-center hover:scale-110 transition-all ease-in '>{row.original.name ?? "N/A"}</Link>
      </>
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Banco" />
    ),
    meta: { title: 'Tipo de Banco' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.type}</span>
      </>
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <BankDropdownActions bank={row.original} />
      </div>
    ),
  },
]
