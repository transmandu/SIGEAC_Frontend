'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import CompanyDropdownActions from '@/components/dropdowns/ajustes/CompanyDropdownActions'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'
import { Company } from '@/types'

export const getColumns = (): ColumnDef<Company>[] => [
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
                  `rotate-90 text-blue-600 dark:text-blue-400`
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
        <DataTableColumnHeader
          filter
          column={column}
          title="Empresa"
        />
      </div>
    ),

    meta: {
      title: 'Empresa',
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center"
        >
          {row.original.name}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'acronym',
    size: 140,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Siglas"
        />
      </div>
    ),

    meta: {
      title: 'Siglas',
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Badge
          className="
            rounded-md
            border
            border-blue-500/20
            bg-blue-500/10
            text-blue-700
            dark:text-blue-300
            hover:bg-blue-500/10
          "
        >
          {row.original.acronym ?? '—'}
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: 'rif',
    size: 220,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="RIF"
        />
      </div>
    ),

    meta: {
      title: 'RIF',
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-sm text-slate-600 dark:text-slate-300 text-center"
        >
          {row.original.rif ?? '—'}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'cod_inac',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Cod. INAC"
        />
      </div>
    ),

    meta: {
      title: 'Cod. INAC',
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center"
        >
          {row.original.cod_inac ?? '—'}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'fiscal_address',
    size: 360,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Dirección Fiscal"
        />
      </div>
    ),

    meta: {
      title: 'Dirección Fiscal',
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="
            block
            max-w-[320px]
            text-sm
            text-slate-600
            dark:text-slate-300
            text-center
            whitespace-normal
            break-words
            leading-snug
          "
          title={row.original.fiscal_address ?? ''}
        >
          {row.original.fiscal_address ?? '—'}
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
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <CompanyDropdownActions
          company={row.original}
        />
      </div>
    ),
  },
]