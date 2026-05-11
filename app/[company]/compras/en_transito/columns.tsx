'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import {
  ChevronRight,
  Loader2,
  MapPin,
  ArrowRight,
  PackageCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { cn } from '@/lib/utils'
import { useUpdateArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import type { TransitArticle } from './types'

function TransitActionButton({
  article,
}: {
  article: TransitArticle
}) {
  const { updateArticleStatus } = useUpdateArticleStatus()

  const pending = updateArticleStatus.isPending
  const status = article.status?.toUpperCase()
  const isReception = status === 'RECEPTION'
  const isTransit = status === 'TRANSIT'

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pending) return

    if (isTransit) {
      await updateArticleStatus.mutateAsync({
        id: article.id,
        status: 'RECEPTION',
      })
    }

    if (isReception) {
      await updateArticleStatus.mutateAsync({
        id: article.id,
        status: 'INCOMING',
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={handleAction}
      className="
        h-7 px-3 gap-1.5
        text-[11px]
        rounded-full
        border border-slate-200/60 dark:border-slate-700/60
        bg-white/50 dark:bg-slate-800/40
        hover:bg-slate-100 dark:hover:bg-slate-800
      "
    >
      {pending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : isReception ? (
        <>
          <ArrowRight className="size-3" />
          Incoming
        </>
      ) : (
        <>
          <PackageCheck className="size-3" />
          Recepción
        </>
      )}
    </Button>
  )
}

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<TransitArticle>[] => [

  {
    id: 'expander',
    size: 40,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.getCanExpand() && (
          <ChevronRight
            className={cn(
              'size-3.5 text-muted-foreground/50 transition-transform',
              row.getIsExpanded() && 'rotate-90 text-emerald-500'
            )}
          />
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'part_number',
    size: 340,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Número de Parte" />
      </div>
    ),

    cell: ({ row }) => {
      const hasAlt = !!row.original.alternative_part_number

      return (
        <div className="flex w-full justify-start">
          <div className="space-y-1 min-w-0">

            <div className="flex items-center gap-2">

              <span className="
                text-[9px] font-semibold uppercase tracking-widest
                px-1.5 py-0.5 rounded-md
                bg-emerald-100/60 dark:bg-emerald-900/30
                text-emerald-700 dark:text-emerald-300
                border border-emerald-200/50 dark:border-emerald-800/40
              ">
                P/N
              </span>

              <Link
                href={`/${selectedCompany?.slug}/almacen/articulos/${row.original.id}`}
                onClick={(e) => e.stopPropagation()}
                className="
                  text-[13px] font-semibold tracking-tight
                  text-slate-900 dark:text-slate-100
                  px-1 py-0.5 rounded
                  hover:text-emerald-600 dark:hover:text-emerald-400
                  transition-colors
                "
              >
                {row.original.part_number}
              </Link>

            </div>
            {hasAlt ? (
              <div className="flex items-center gap-2">

                <span className="
                  text-[9px] font-semibold uppercase tracking-widest
                  px-1.5 py-0.5 rounded-md
                  bg-slate-200/60 dark:bg-slate-700/40
                  text-slate-600 dark:text-slate-300
                  border border-slate-300/40 dark:border-slate-600/40
                ">
                  ALT
                </span>

                <span className="font-mono text-[11px] text-muted-foreground">
                  {row.original.alternative_part_number}
                </span>

              </div>
            ) : (
              <div className="flex items-center gap-2">

                <span className="
                  text-[9px] font-semibold uppercase tracking-widest
                  px-1.5 py-0.5 rounded-md
                  bg-slate-100 dark:bg-slate-800
                  text-slate-400
                ">
                  ALT
                </span>

                <span className="text-[11px] text-muted-foreground/40 italic">
                  Sin alternativo
                </span>

              </div>
            )}

          </div>
        </div>
      )
    },
  },

  {
    accessorKey: 'batch',
    size: 240,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {row.original.batch?.name ?? 'Sin descripción'}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'location',
    size: 280,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Ubicación" />
      </div>
    ),

    cell: ({ row }) => {
      const location = row.original.batch?.warehouse?.location

      return (
        <div className="flex justify-center w-full">
          {location ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <MapPin className="size-3.5 opacity-60" />
              <span className="truncate">{location.address}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: 'status',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    cell: ({ row }) => {
      const status = row.original.status?.toUpperCase()
      const isTransit = status === 'TRANSIT'
      const isReception = status === 'RECEPTION'

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
                  `,

                  isTransit && `
                    border-yellow-500/30
                    bg-yellow-500/10
                    text-yellow-700
                    dark:text-yellow-300
                    hover:bg-yellow-500/15
                  `,

                  isReception && `
                    border-emerald-500/30
                    bg-emerald-500/10
                    text-emerald-700
                    dark:text-emerald-300
                    hover:bg-emerald-500/15
                  `,

                  !isTransit &&
                    !isReception &&
                    `
                      border-red-500/30
                      bg-red-500/10
                      text-red-700
                      dark:text-red-300
                      hover:bg-red-500/15
                    `
                )}
          >
            {isTransit ? 'En tránsito' : 'En recepción'}
          </Badge>

        </div>
      )
    },
  },

  {
    id: 'actions',
    size: 160,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <TransitActionButton article={row.original} />
      </div>
    ),
  },
]