'use client'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import QuoteDropdownActions from '@/components/dropdowns/mantenimiento/compras/QuoteDropdownActions'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { Quote } from '@/types/purchase'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Link from 'next/link'

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

      const pending = status === 'PENDIENTE'
      const approved = status === 'APROBADA'

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
            {status?.toUpperCase?.() ?? 'N/A'}
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