"use client"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { PaymentMethod } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<PaymentMethod>[] = [
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
    accessorKey: "bank_accounts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuentas habilitadas" />
    ),
    meta: { title: 'Cuentas habilitadas' },
    cell: ({ row }) => {
      const accounts = row.original.bank_accounts ?? [];
      return (
        <div className='flex flex-wrap justify-center gap-1'>
          {accounts.length === 0 && <span className='text-xs text-muted-foreground italic'>Sin cuentas</span>}
          {accounts.map((account) => (
            <Badge key={account.id} variant="secondary" className='text-[10px]'>{account.name} ({account.account_number})</Badge>
          ))}
        </div>
      );
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    meta: { title: 'Creado' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "N/A"}
        </span>
      </>
  },
]
