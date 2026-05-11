'use client'

import { Row } from '@tanstack/react-table'
import { Hash } from 'lucide-react'
import type { TransitArticle } from '../types'

type Props = {
  row: Row<TransitArticle>
}

export default function TransitSubRow({ row }: Props) {
  const article = row.original

  const hasInfo =
    article.manufacturer ||
    article.condition ||
    article.quantity != null ||
    article.unit ||
    article.serial

  if (!hasInfo) {
    return (
      <div className="px-4 py-2 text-[11px] text-muted-foreground/60 italic">
        Sin información adicional
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-3">

      <div className="grid grid-cols-4 gap-6 text-[11px]">

        {/* SERIAL (AHORA COMO COLUMNA NORMAL) */}
        <div className="space-y-0.5">
          <div className="text-muted-foreground/60">
            Serial
          </div>

          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200">
            {article.serial ? (
              <>
                <Hash className="size-3 opacity-60" />
                {article.serial}
              </>
            ) : (
              '—'
            )}
          </div>
        </div>

        {/* MANUFACTURER */}
        <div className="space-y-0.5">
          <div className="text-muted-foreground/60">
            Fabricante
          </div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {article.manufacturer?.name ?? '—'}
          </div>
        </div>

        {/* CONDITION */}
        <div className="space-y-0.5">
          <div className="text-muted-foreground/60">
            Condición
          </div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {article.condition?.name ?? '—'}
          </div>
        </div>

        {/* QUANTITY */}
        <div className="space-y-0.5">
            <div className="text-muted-foreground/60">
                Cantidad
            </div>
            <div className="
                flex items-baseline gap-2
                tabular-nums
            ">
                <span className="
                text-sm font-semibold
                text-slate-900 dark:text-slate-100
                tracking-tight
                ">
                {article.quantity ?? '—'}
                </span>
                {article.unit && (
                <span className="
                    text-[10px]
                    px-1.5 py-0.5
                    rounded
                    bg-slate-100/70 dark:bg-slate-800/40
                    border border-slate-200/50 dark:border-slate-700/40
                    text-muted-foreground
                    uppercase tracking-wide
                ">
                    {article.unit}
                </span>
                )}
            </div>
        </div>

      </div>

    </div>
  )
}