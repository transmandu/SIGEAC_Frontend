"use client"

import { CardDropdownActions } from "@/components/dropdowns/ajustes/BancosPagosDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Card>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: 'Nombre' },
    cell: ({ row }) =>
      <>
        <span className='font-bold flex justify-center'>{row.original.name}</span>
      </>
  },
  {
    accessorKey: "card_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Tarjeta" />
    ),
    meta: { title: 'Nro. de Tarjeta' },
    cell: ({ row }) =>
      <>
        <span className='font-medium flex justify-center'>****-******-****-{row.original.card_number}</span>
      </>
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      // El método define el tipo de la tarjeta (Crédito / Débito / Prepagada).
      <DataTableColumnHeader column={column} title="Método de Pago" />
    ),
    meta: { title: 'Método de Pago' },
    cell: ({ row }) =>
      <>
        <span className='font-medium flex justify-center italic'>{row.original.payment_method?.name ?? "N/A"}</span>
      </>
  },
  {
    id: "bank",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banco / Cuenta" />
    ),
    meta: { title: 'Banco / Cuenta' },
    cell: ({ row }) => {
      const account = row.original.bank_account;
      return (
        <span className='text-muted-foreground flex justify-center italic'>
          {account ? `${account.bank?.name ?? "N/A"} — ${account.account_number}` : "N/A"}
        </span>
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
        <CardDropdownActions card={row.original} />
      </div>
    ),
  },
]
