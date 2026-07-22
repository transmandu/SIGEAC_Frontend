'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { History, Lock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import React from 'react'
import type { GeneralCostRow, GeneralCostColumnsArgs } from '@/types/purchase'
import { costInBaseUnit } from '../_utils/costInBaseUnit'

export type { GeneralCostRow, GeneralCostColumnsArgs }

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

export function getGeneralCostColumns({
  onCostChange,
  onViewHistory,
}: GeneralCostColumnsArgs): ColumnDef<GeneralCostRow>[] {

  return [

    {
      accessorKey: 'description',
      size: 340,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Descripción" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block max-w-[320px] break-words text-sm font-semibold text-foreground text-center">
            {row.original.description ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'brand_model',
      size: 260,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Modelo / Marca" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block max-w-[240px] break-words text-sm text-slate-600 dark:text-slate-300 text-center">
            {row.original.brand_model ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'variant_type',
      size: 220,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Present. / Especif." />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="block max-w-[220px] break-words text-sm text-slate-500 dark:text-slate-400 text-center">
            {row.original.variant_type ?? '—'}
          </span>
        </div>
      ),
    },

    {
      accessorKey: 'unit_label',
      size: 120,
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Unidad" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-100/70 dark:bg-slate-800/40 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            {row.original.unit_label ?? '—'}
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
        const hasCost = Number(current ?? 0) > 0
        const meta = table.options.meta as any
        const costDrafts = meta?.costDrafts ?? {}
        const draft = costDrafts[id]
        const modified = !hasCost && isModified(id, costDrafts, current)

        // El costo crudo más reciente puede estar en una unidad distinta a la
        // base (ej: $10 · CAJA). La columna muestra el equivalente POR UNIDAD
        // BASE ($0.50 · UNID); el sheet de historial conserva el costo crudo.
        const latest = row.original.cost_history?.[0]
        const rawUnitId = latest?.unit_id ?? null
        const baseUnitId = row.original.primary_unit_id ?? null
        const baseCost = costInBaseUnit(
          Number(current ?? 0),
          rawUnitId,
          baseUnitId,
          row.original.conversions,
        )

        // eslint-disable-next-line no-console
        console.log('[COSTO-DEBUG]', row.original.description, {
          cost: current,
          rawUnitId,
          baseUnitId,
          latest,
          conversions: row.original.conversions,
          baseCost,
        })
        const convertedFromUnit =
          hasCost &&
          rawUnitId != null &&
          baseUnitId != null &&
          rawUnitId !== baseUnitId &&
          baseCost !== Number(current ?? 0)

        const baseCostValue = Number.isInteger(baseCost)
          ? String(baseCost)
          : String(Number(baseCost.toFixed(4)))

        const currentValue =
          current !== undefined && current !== null ? String(current) : '0'

        const draftValue =
          draft !== undefined && draft !== null
            ? String(draft)
            : ''

        if (hasCost) {
          return (
            <div className="flex justify-center w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="
                        flex items-center gap-1.5 rounded-md border px-2 py-1
                        bg-slate-100/70 dark:bg-slate-800/40
                        border-slate-200 dark:border-slate-700/60
                        cursor-default
                      "
                    >
                      <span className="text-xs text-muted-foreground">$</span>
                      <span className="text-sm tabular-nums text-center text-foreground">
                        {baseCostValue}
                      </span>
                      {convertedFromUnit ? (
                        <span className="text-[10px] text-muted-foreground">
                          /{row.original.unit_label}
                        </span>
                      ) : null}
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[240px] text-center">
                    {convertedFromUnit ? (
                      <>
                        Costo más reciente: ${currentValue}
                        {latest?.unit_label ? ` · ${latest.unit_label}` : ''}.
                        Equivale a ${baseCostValue} por {row.original.unit_label}.
                        Solo cambia con una nueva compra.
                      </>
                    ) : (
                      'Este artículo ya tiene costo registrado. Solo cambia con una nueva compra.'
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
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

    {
      id: 'history',
      size: 60,
      header: () => <div className="flex justify-center w-full text-xs text-muted-foreground">Historial</div>,
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onViewHistory?.(row.original)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
}