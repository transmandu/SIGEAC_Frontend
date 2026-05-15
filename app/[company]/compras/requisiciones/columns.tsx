'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import RequisitionsDropdownActions from '@/components/dropdowns/mantenimiento/compras/RequisitionDropdownActions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Requisition } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<Requisition>[] => [
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
              className={cn(
                `size-3.5 text-muted-foreground/50 transition-transform duration-150`,

                row.getIsExpanded() &&
                  `rotate-90 text-emerald-600 dark:text-emerald-400
                  `
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
    accessorKey: 'order_number',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          filter
          column={column}
          title="Nro. Req."
        />
      </div>
    ),

    meta: {
      title: 'Nro. Req.',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/requisiciones/${row.original.order_number}`}
          className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.order_number}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: 'justification',
    size: 420,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Justificación"
        />
      </div>
    ),
    meta: {
      title: 'Justificación',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="block max-w-[400px]
            text-sm text-slate-600 dark:text-slate-300 text-center whitespace-normal break-words leading-snug"
          title={row.original.justification ?? ''}
        >
          {row.original.justification ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'requested_by',
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Solicitado por"
        />
      </div>
    ),
    meta: {
      title: 'Solicitado por',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center"
        >
          {row.original.requested_by ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Estado"
        />
      </div>
    ),
    meta: {
      title: 'Estado',
    },
    cell: ({ row }) => {
      const status = row.original.status
      const process =
        status === 'PROCESO' ||
        status === 'COTIZADO'
      const approved = status === 'APROBADO'
      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(
              `rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0`,

              process && `border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200`,

              approved && ` border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200`,

              !process && !approved && `border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200`
            )}
          >
            {status}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'submission_date',
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Fecha de Creación"
        />
      </div>
    ),
    meta: {
      title: 'Fecha de Creación',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-s text-slate-600 dark:text-slate-300 text-center"
        >
          {format( new Date(row.original.submission_date), 'PPP', { locale: es } )}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Tipo"
        />
      </div>
    ),
    meta: {
      title: 'Tipo',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-sm text-slate-500 dark:text-slate-400 text-center"
        >
          {row.original.type ?? '—'}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    size: 120,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Acciones"
        />
      </div>
    ),
    meta: {
      title: 'Acciones',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <RequisitionsDropdownActions
          req={row.original}
        />
      </div>
    ),
  },
]