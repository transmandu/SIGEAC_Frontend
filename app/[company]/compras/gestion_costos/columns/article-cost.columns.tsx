'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import React from 'react'

export type ArticleCostRow = {
  id: number
  batch_name?: string
  part_number?: string
  serial?: string
  unit_label?: string
  cost?: number
}

export type ArticleCostColumnsArgs = {
  onCostChange: (id: number, value: string) => void
}

const isModified = (
  id: number,
  drafts: Record<number, string | number | undefined>,
  current?: number
) => {
  const draft = drafts[id]

  if (draft === undefined || draft === null) return false

  const draftStr = String(draft)
  const currentStr =
    current !== undefined && current !== null ? String(current) : ''

  return draftStr !== currentStr || draftStr === '0'
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

    // {
    //   accessorKey: 'unit_label',
    //   size: 120,
    //   header: ({ column }) => (
    //     <div className="flex justify-center w-full">
    //       <DataTableColumnHeader column={column} title="Unidad" />
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="flex justify-center w-full">
    //       <span className="block text-sm text-slate-500 dark:text-slate-400 text-center">
    //         {row.original.unit_label ?? '—'}
    //       </span>
    //     </div>
    //   ),
    // },

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
        const modified = isModified(id, costDrafts, current)

        const currentValue =
          current !== undefined && current !== null ? String(current) : '0'

        const draftValue =
          draft !== undefined && draft !== null ? String(draft) : ''

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

              {modified ? (
                <>
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {currentValue}
                  </span>

                  <span className="text-xs text-muted-foreground">→</span>

                  <Input
                    inputMode="decimal"
                    value={draftValue}
                    autoFocus
                    onChange={(e) => onCostChange(id, e.target.value)}
                    className="
                      h-6 w-16 border-0 bg-transparent p-0
                      text-sm tabular-nums text-center font-medium
                      text-foreground
                      focus-visible:ring-0 focus-visible:ring-offset-0
                    "
                  />
                </>
              ) : (
                <Input
                  inputMode="decimal"
                  value=""
                  placeholder={currentValue}
                  onChange={(e) => onCostChange(id, e.target.value)}
                  className="
                    h-6 w-16 border-0 bg-transparent p-0
                    text-sm tabular-nums text-center
                    text-muted-foreground
                    focus-visible:ring-0 focus-visible:ring-offset-0
                  "
                />
              )}

              {modified && (
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
          </div>
        )
      },
    },
  ]
}