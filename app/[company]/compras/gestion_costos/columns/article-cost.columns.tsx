'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import React from 'react'
import { CopyPlus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import type { ArticleCostRow, ArticleCostColumnsArgs } from '@/types/purchase'

export type { ArticleCostRow, ArticleCostColumnsArgs }

const usdFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const normalizeCostInput = (value: string) => {
  return value
    .replace(',', '.')        // coma → punto
    .replace(/[^0-9.]/g, '')  // elimina basura
    .replace(/(\..*)\./g, '$1') // solo un punto decimal
}

export function getArticleCostColumns({
  onCostChange,
}: ArticleCostColumnsArgs): ColumnDef<ArticleCostRow>[] {

  return [

    {
      accessorKey: 'part_number',
      size: 220,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Part Number" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block max-w-[200px] break-words text-sm font-semibold text-foreground text-center">
            {row.original.part_number ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'batch_name',
      size: 320,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Descripción" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block max-w-[300px] break-words text-sm text-slate-600 dark:text-slate-300 text-center">
            {row.original.batch_name ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'serial',
      size: 220,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Serial / Lote" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block max-w-[200px] break-words text-sm text-slate-500 dark:text-slate-400 text-center">
            {row.original.serial ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'condition_name',
      size: 120,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Condición" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block text-sm text-slate-500 dark:text-slate-400 text-center">
            {row.original.condition_name ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'cost',
      size: 140,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Costo Unitario" />
        </div>
      ),

      cell: ({ row, table }) => {
        const id = row.original.id
        const current = row.original.cost

        const meta = table.options.meta as any
        const costDrafts = meta?.costDrafts ?? {}
        const draft = costDrafts[id]

        const modified =
          draft !== undefined &&
          draft !== null &&
          String(draft) !== String(current ?? 0)

        const groupRows = (row.original as any)._groupRows
        const groupIndex = (row.original as any)._groupIndex

        const currentValue =
          current !== undefined && current !== null
            ? usdFormatter.format(current)
            : usdFormatter.format(0)

        const handlePropagateFromRow = () => {
          if (!groupRows || groupIndex === undefined) return

          const value = draft ?? current ?? 0

          groupRows.forEach((r: any, idx: number) => {
            if (idx > groupIndex) {
              onCostChange(r.id, String(value))
            }
          })
        }

        return (
          <div className="flex justify-center w-full">
            <div
              className={cn(
                'group flex items-center gap-1.5 rounded-md border px-2 py-1 transition-all',
                'bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm',
                modified
                  ? 'border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700/60'
              )}
            >
              <span className="text-xs text-muted-foreground">$</span>

              <Input
                inputMode="decimal"
                value={draft ?? ''}
                placeholder={currentValue}
                onChange={(e) =>
                  onCostChange(id, normalizeCostInput(e.target.value))
                }
                className="
                  h-6 w-16 border-0 bg-transparent p-0
                  text-sm tabular-nums text-center font-medium
                  text-foreground
                  focus-visible:ring-0 focus-visible:ring-offset-0
                "
              />

              {modified && groupRows && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePropagateFromRow()
                        }}
                        className="
                          ml-1 p-1 rounded-md
                          hover:bg-slate-200/60
                          dark:hover:bg-slate-700/60
                          overflow-visible
                        "
                      >
                        <CopyPlus className="size-3.5 text-emerald-500" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>
                      + Replicar costo
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )
      },
    }
  ]
}