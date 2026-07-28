'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Vendor } from '@/types'
import VendorDropdownActions from '@/components/dropdowns/general/VendorDropdownActions'

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<Vendor>[] => [
  {
    id: 'expander',
    size: 40,
    header: () => null,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      return (
        <div className="flex justify-center w-full">
          {canExpand ? (
            <ChevronRight
              className={cn(`size-3.5 text-muted-foreground/50 transition-transform`,
                row.getIsExpanded() && `rotate-90 text-blue-600 dark:text-blue-400`
              )}
            />
          ) : (
            <div className="size-3.5" />
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    size: 260,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre"/>
      </div>
    ),
    meta: { title: 'Nombre' },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    size: 240,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Correo"/>
      </div>
    ),
    meta: { title: 'Correo' },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.email ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Teléfono"/>
      </div>
    ),
    meta: { title: 'Teléfono' },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center tabular-nums">
          {row.original.phone ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo"/>
      </div>
    ),
    meta: { title: 'Tipo' },
    cell: ({ row }) => {
      const isVendor = row.original.type === 'VENDOR'
      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0`,
            isVendor
              ? `border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 dark:hover:text-blue-200`
              : `border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-400/15 dark:hover:text-emerald-200`
          )}
          >
            {isVendor
              ? 'Proveedor'
              : 'Beneficiario'}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'actions',
    size: 120,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones"/>
      </div>
    ),
    meta: { title: 'Acciones' },
    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <VendorDropdownActions vendor={row.original}/>
      </div>
    ),
  },
]
