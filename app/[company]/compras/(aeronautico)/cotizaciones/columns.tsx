'use client'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import QuoteDropdownActions from '@/components/dropdowns/mantenimiento/compras/QuoteDropdownActions'

import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { Truck } from 'lucide-react'

import type { Quote } from '@/types/purchase'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Link from 'next/link'

const QUOTE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  APPROVED: 'APROBADA',
  REJECTED: 'RECHAZADA',
}

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<Quote>[] => [
  {
    accessorKey: 'quote_number',
    size: 180,

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
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/cotizaciones/${row.original.quote_number}`}
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
      </div>
    ),
  },

  {
    accessorKey: 'requisition_order',
    size: 200,

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
          href={`/${selectedCompany?.slug}/compras/requisiciones/${row.original.requisition_order?.order_number}`}
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
    size: 200,

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
          className="
            text-sm
            text-slate-600 dark:text-slate-300
            text-center
          "
        >
          {format(new Date(row.original.quote_date), 'PPP', {
            locale: es,
          })}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'vendor',
    size: 220,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Proveedor"
        />
      </div>
    ),

    meta: {
      title: 'Proveedor',
    },

    cell: ({ row }) => {
      const quote = row.original

      const vendorNames = Array.from(
        new Set(
          [
            quote.vendor?.name,
            ...(quote.article_quote_order?.map((a) => a.vendor?.name) ?? []),
          ].filter((name): name is string => !!name)
        )
      )

      if (vendorNames.length === 0) {
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

      if (vendorNames.length === 1) {
        return (
          <div className="flex justify-center w-full">
            <span
              className="
                text-sm font-medium
                text-slate-700 dark:text-slate-200
                text-center
              "
            >
              {vendorNames[0]}
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
                <Truck className="size-3" />
                {vendorNames.length} PROVEEDORES
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="center"
              className="w-56 p-2"
            >
              <span className="block px-1 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none">
                Proveedores
              </span>

              <div className="space-y-0.5">
                {vendorNames.map((name) => (
                  <div
                    key={name}
                    className="
                      flex items-center gap-2 rounded-md px-2 py-1
                      text-sm text-slate-700 dark:text-slate-200
                    "
                  >
                    <Truck className="size-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="truncate">{name}</span>
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
    size: 200,

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

      return (
        <div className="flex justify-center w-full">
          <span
            className="
              text-sm
              text-slate-600 dark:text-slate-300
              text-center
            "
          >
            Total de {total} artículo(s)
          </span>
        </div>
      )
    },
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
      <div className="flex justify-center w-full">
        <QuoteDropdownActions quote={row.original} />
      </div>
    ),
  },
]