'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { GeneralArticleIntake } from '@/types/purchase'

export const getColumns = (): ColumnDef<GeneralArticleIntake>[] => [

  {
    accessorKey: 'description',
    size: 300,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Artículo" />
      </div>
    ),

    cell: ({ row }) => {
      const { description, brand_model, variant_type } = row.original

      return (
        <div className="flex w-full justify-start">
          <div className="space-y-1 min-w-0">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {description}
            </span>

            {(brand_model || variant_type) && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {brand_model && <span>{brand_model}</span>}
                {brand_model && variant_type && <span>·</span>}
                {variant_type && <span>{variant_type}</span>}
              </div>
            )}
          </div>
        </div>
      )
    },
  },

  {
    accessorKey: 'quantity',
    size: 140,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cantidad" />
      </div>
    ),

    cell: ({ row }) => {
      const { quantity, unit } = row.original

      return (
        <div className="flex justify-center w-full">
          <span className="text-sm font-semibold tabular-nums">
            {quantity}
            {unit?.label && (
              <span className="ml-1 font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                {unit.label}
              </span>
            )}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'purchase_order',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Solicitud de Compra" />
      </div>
    ),

    cell: ({ row }) => {
      const orderNumber = row.original.purchase_order?.quote_order?.requisition_order?.order_number

      return (
        <div className="flex justify-center w-full">
          <span className="text-xs text-muted-foreground">
            {orderNumber ?? '—'}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'arrived_at',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Llegada" />
      </div>
    ),

    cell: ({ row }) => {
      const { arrived_at } = row.original

      return (
        <div className="flex justify-center w-full">
          <span className="text-xs text-muted-foreground">
            {arrived_at ? format(new Date(arrived_at), 'dd/MM/yyyy HH:mm') : '—'}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'registered_by',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Entregado por" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-xs text-muted-foreground uppercase">
          {row.original.registered_by}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'status',
    size: 160,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    cell: ({ row }) => {
      const { status } = row.original
      const isPending = status === 'PENDING'
      const isRejected = status === 'REJECTED'

      return (
        <div className="flex justify-center w-full">
          <Badge
            variant="outline"
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default uppercase',
              isPending
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15'
                : isRejected
                  ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
            )}
          >
            {isPending ? 'Pendiente' : isRejected ? 'Rechazada' : 'Confirmada'}
          </Badge>
        </div>
      )
    },
  },

  {
    accessorKey: 'confirmed_by',
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Confirmación" />
      </div>
    ),

    cell: ({ row }) => {
      const { status, confirmed_by, confirmed_at, rejected_by, rejected_at, rejection_reason } = row.original

      if (status === 'PENDING') {
        return (
          <div className="flex justify-center w-full">
            <span className="text-muted-foreground/40 text-xs">—</span>
          </div>
        )
      }

      if (status === 'REJECTED') {
        return (
          <div className="flex justify-center w-full">
            <span className="text-[11px] text-muted-foreground text-center leading-snug">
              Rechazado por:
              <br />
              <span className="uppercase font-medium">{rejected_by}</span>
              {rejected_at && (
                <>
                  <br />
                  El {format(new Date(rejected_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </>
              )}
              {rejection_reason && (
                <>
                  <br />
                  <span className="italic text-red-600/80 dark:text-red-400/80">
                    “{rejection_reason}”
                  </span>
                </>
              )}
            </span>
          </div>
        )
      }

      return (
        <div className="flex justify-center w-full">
          <span className="text-[11px] text-muted-foreground text-center leading-snug">
            Confirmado por:
            <br />
            <span className="uppercase font-medium">{confirmed_by}</span>
            {confirmed_at && (
              <>
                <br />
                El {format(new Date(confirmed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </>
            )}
          </span>
        </div>
      )
    },
  },
]
