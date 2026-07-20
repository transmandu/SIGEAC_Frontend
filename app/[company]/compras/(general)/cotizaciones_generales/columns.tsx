'use client'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import QuoteDropdownActions from '@/components/dropdowns/mantenimiento/compras/QuoteDropdownActions'

import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { Link2, Store } from 'lucide-react'

import type { Quote } from '@/types/purchase'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Link from 'next/link'
import EyePreviewIcon from '@/components/misc/EyePreviewIcon'

const QUOTE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  APPROVED: 'APROBADA',
  REJECTED: 'RECHAZADA',
}

export const getColumns = (
  selectedCompany?: { slug: string },
  onPreview?: (quote: Quote) => void,
  selectedPreviewId?: number | null
): ColumnDef<Quote>[] => [
  {
    accessorKey: 'quote_number',
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          filter
          column={column}
          title="Nro. Cotización"
        />
      </div>
    ),

    meta: {
      title: 'Nro. Cotización',
    },

    cell: ({ row }) => (
      <div className="flex flex-col items-center gap-1 w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/cotizaciones_generales/${row.original.quote_number}`}
          className="
            text-sm font-semibold
            text-slate-700 dark:text-slate-200
            text-center
            hover:text-emerald-600
            dark:hover:text-emerald-400
            transition-colors
          "
        >
          {row.original.quote_number}
        </Link>
        {row.original.parent_quote_order && (
          <span
            className="inline-flex items-center gap-1 rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300"
            title={`Complementaria de ${row.original.parent_quote_order.quote_number}`}
          >
            <Link2 className="size-2.5" />
            Complementaria
          </span>
        )}
      </div>
    ),
  },

  {
    accessorKey: 'requisition_order',
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Nro. Requisición"
        />
      </div>
    ),

    meta: {
      title: 'Nro. Requisición',
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/requisiciones_generales/${row.original.requisition_order?.order_number}`}
          className="
            text-sm
            text-slate-600 dark:text-slate-300
            text-center
            hover:text-slate-900
            dark:hover:text-slate-400
            hover:underline
            underline-offset-4
            decoration-1
          "
        >
          {row.original.requisition_order?.order_number ?? 'N/A'}
        </Link>
      </div>
    ),
  },

  {
    accessorKey: 'quote_date',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Fecha de Cotización"
        />
      </div>
    ),

    meta: {
      title: 'Fecha de Cotización',
    },

    cell: ({ row }) => {
      const date = new Date(row.original.quote_date);

      return (
        <div className="flex justify-center w-full">
          <span className="text-s text-slate-600 dark:text-slate-300 text-center font-medium tracking-wide uppercase">
            {format(date, "dd MMM yyyy", { locale: es })}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: 'retailer',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Comercio"
        />
      </div>
    ),

    meta: {
      title: 'Comercio',
    },

    cell: ({ row }) => {
      const quote = row.original

      const retailerNames = Array.from(
        new Set(
          [
            quote.retailer?.name,
            ...(quote.general_article_quote_order?.map((a) => a.retailer?.name) ?? []),
          ].filter((name): name is string => !!name)
        )
      )

      if (retailerNames.length === 0) {
        return (
          <div className="flex justify-center w-full">
            <span
              className="
                text-sm font-medium
                text-slate-700 dark:text-slate-200
                text-center
              "
            >
              N/A
            </span>
          </div>
        )
      }

      if (retailerNames.length === 1) {
        return (
          <div className="flex justify-center w-full">
            <span
              className="
                text-sm font-medium
                text-slate-700 dark:text-slate-200
                text-center
              "
            >
              {retailerNames[0]}
            </span>
          </div>
        )
      }

      return (
        <div className="flex justify-center w-full">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="
                  inline-flex items-center gap-1.5
                  rounded-md border px-2 py-0.5
                  text-[10px] font-semibold tracking-wide
                  shadow-sm transition-colors duration-150
                  border-slate-500/30 bg-slate-500/10
                  text-slate-700 dark:text-slate-300
                  hover:bg-slate-500/15 dark:hover:text-slate-200
                "
              >
                <Store className="size-3" />
                {retailerNames.length} COMERCIOS
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="center"
              className="w-56 p-2"
            >
              <span className="block px-1 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none">
                Comercios
              </span>

              <div className="space-y-0.5">
                {retailerNames.map((name) => (
                  <div
                    key={name}
                    className="
                      flex items-start gap-2 rounded-md px-2 py-1
                      text-sm text-slate-700 dark:text-slate-200
                    "
                  >
                    <Store className="size-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
                    <span className="break-words">{name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )
    },
  },

  {
    accessorKey: 'status',
    size: 150,

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

      const pending = status === 'PENDING'
      const approved = status === 'APPROVED'

      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(
              `
                rounded-md
                border
                px-2 py-0.5
                text-[10px]
                font-semibold
                tracking-wide
                shadow-sm
                transition-colors duration-150
                cursor-default
                hover:scale-100
                hover:translate-y-0
              `,

              pending && `
                border-yellow-500/30
                bg-yellow-500/10
                text-yellow-700
                dark:text-yellow-300

                hover:bg-yellow-500/15
                hover:text-yellow-700
                dark:hover:text-yellow-200
              `,

              approved && `
                border-emerald-500/30
                bg-emerald-500/10
                text-emerald-700
                dark:text-emerald-300

                hover:bg-emerald-500/15
                dark:hover:text-emerald-200
              `,

              !pending &&
                !approved &&
                `
                  border-red-500/30
                  bg-red-500/10
                  text-red-700
                  dark:text-red-300

                  hover:bg-red-500/15
                  dark:hover:text-red-200
                `
            )}
          >
            {QUOTE_STATUS_LABELS[status] ?? status?.toUpperCase?.() ?? 'N/A'}
          </Badge>
        </div>
      )
    }
  },

  {
    accessorKey: 'article_quote_order',
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Artículos"
        />
      </div>
    ),

    meta: {
      title: 'Artículos',
    },

    cell: ({ row }) => {
      const total =
        (row.original.article_quote_order?.length ?? 0) +
        (row.original.general_article_quote_order?.length ?? 0)
      const isActive = selectedPreviewId === row.original.id

      return (
        <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onPreview?.(row.original)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                    'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300',
                    'hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400',
                    isActive && 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  )}
                >
                  <EyePreviewIcon active={isActive} className="size-3.5" />
                  {total} {total === 1 ? 'artículo' : 'artículos'}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isActive ? 'Cerrar vista previa' : 'Vista previa de la cotización'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
  },

  {
    id: 'actions',
    size: 80,

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
      <div className="flex justify-center w-full">
        <QuoteDropdownActions quote={row.original} />
      </div>
    ),
  },
]