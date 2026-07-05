"use client"

import { BankAccountDropdownActions } from "@/components/dropdowns/ajustes/BancosPagosDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { BankAccount } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: 'Nombre' },
    cell: ({ row }) =>
      <>
        <Link href={`/ajustes/banca/cuentas/${row.original.account_number}`} className='font-bold flex justify-center'>{row.original.name ?? "N/A"}</Link>
      </>
  },
  {
    accessorKey: "account_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Cuenta" />
    ),
    meta: { title: 'Nro. de Cuenta' },
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
    meta: { title: 'Banco' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.bank.name}</span>
      </>
  },
  {
    accessorKey: "account_owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titular" />
    ),
    meta: { title: 'Titular' },
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
    meta: { title: 'Tipo de Cuenta' },
    cell: ({ row }) =>
      <>
        <span className='font-bold flex justify-center italic'>{row.original.account_type}</span>
      </>
  },
  {
    accessorKey: "payment_methods",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Métodos de Pago" />
    ),
    meta: { title: 'Métodos de Pago' },
    cell: ({ row }) => {
      const methods = row.original.payment_methods ?? [];
      return (
        <div className='flex flex-wrap justify-center gap-1'>
          {methods.length === 0 && <span className='text-xs text-muted-foreground italic'>Sin métodos</span>}
          {methods.map((method) => (
            <Badge key={method.id} variant="secondary" className='text-[10px]'>{method.name}</Badge>
          ))}
        </div>
      );
    }
  },
  {
    accessorKey: "companies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compañías" />
    ),
    meta: { title: 'Compañías' },
    cell: ({ row }) => {
      const companies = row.original.companies ?? [];
      return (
        <div className='flex flex-wrap justify-center gap-1'>
          {companies.length === 0 && <span className='text-xs text-muted-foreground italic'>Sin compañías</span>}
          {companies.map((company) => (
            <Badge key={company.id} variant="outline" className='text-[10px]'>{company.name}</Badge>
          ))}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <BankAccountDropdownActions account={row.original} />
      </div>
    ),
  },
]
