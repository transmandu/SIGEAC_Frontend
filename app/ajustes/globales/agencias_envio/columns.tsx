'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ShippingAgency } from '@/types'
import ShippingAgencyDropdownActions from '@/components/dropdowns/general/ShippingAgencyDropdownActions'

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<ShippingAgency>[] => [
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
    accessorKey: 'code',
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Código"/>
      </div>
    ),
    meta: { title: 'Código' },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.code ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    size: 420,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Descripción"/>
      </div>
    ),
    meta: { title: 'Descripción' },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="block max-w-[380px] text-sm text-slate-600 dark:text-slate-300 text-center whitespace-normal break-words leading-snug" title={row.original.description ?? ''}>
          {row.original.description ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo"/>
      </div>
    ),
    meta: { title: 'Tipo' },
    cell: ({ row }) => {
      const isNational = row.original.type === 'NATIONAL'
      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0`,
            isNational
              ? `border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 dark:hover:text-blue-200`
              : `border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300 hover:bg-sky-400/15 dark:hover:text-sky-200`
          )}
          >
            {isNational
              ? 'Nacional'
              : 'Internacional'}
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
        <ShippingAgencyDropdownActions agency={row.original}/>
      </div>
    ),
  },
]