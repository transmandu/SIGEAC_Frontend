'use client'

import { Row } from '@tanstack/react-table'
import { MapPin } from 'lucide-react'
import { PurchaseOrder } from '@/types'

export default function PurchaseOrderSubRow({
  row,
}: {
  row: Row<PurchaseOrder>
}) {
  const articles = row.original.article_purchase_order

  if (!articles?.length) {
    return (
      <div className="px-4 py-2">
        <p className="text-[11px] text-muted-foreground/60 italic">
          Sin artículos registrados
        </p>
      </div>
    )
  }

  const grid =
    'grid grid-cols-[1fr_60px_90px_110px_110px_160px] items-center'

  return (
    <div className="px-4 py-2 space-y-2">

      <div
        className={`
          ${grid}
          text-[10px]
          uppercase tracking-wider
          text-muted-foreground/60
          border-b border-slate-200/40 dark:border-slate-700/50
          pb-2
        `}
      >
        <div className="pl-2">
          Artículo
        </div>

        <div className="flex items-center justify-center w-full">
          Cant.
        </div>

        <div className="flex items-center justify-center w-full">
          P.Unit
        </div>

        <div className="flex items-center justify-center w-full">
          Tracking USA
        </div>

        <div className="flex items-center justify-center w-full">
          Tracking Envío
        </div>

        <div className="flex items-center justify-center w-full">
          Ubicación
        </div>
      </div>

      <div className="space-y-[4px]">

        {articles.map((article) => (
          <div
            key={article.id}
            className={`
              ${grid}
              px-2 py-2
              rounded-md

              bg-slate-50/70
              dark:bg-slate-900/40

              border
              border-slate-200/50
              dark:border-slate-700/50

              text-[11px]
              text-slate-600
              dark:text-slate-300

              hover:bg-slate-100/70
              dark:hover:bg-slate-800/50

              transition-colors
            `}
          >

            <div className="min-w-0 flex flex-col justify-center">

              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="
                    uppercase
                    tracking-wide
                    text-[9px]
                    opacity-70
                    shrink-0
                    dark:text-slate-400
                  "
                >
                  P/N
                </span>

                <span
                  className="
                    font-medium
                    text-[12px]
                    text-slate-800
                    dark:text-slate-100
                    truncate
                  "
                >
                  {article.article_part_number}
                </span>
              </div>

              <div
                className="
                  flex items-center gap-2
                  text-[10px]
                  text-muted-foreground
                  dark:text-slate-400
                  mt-0.5
                "
              >
                <span
                  className="
                    uppercase
                    text-[9px]
                    opacity-70
                    shrink-0
                  "
                >
                  ALT
                </span>

                <span className="truncate">
                  {article.article_alt_part_number ?? 'Sin alterno'}
                </span>
              </div>

            </div>

            <div className="flex items-center justify-center w-full tabular-nums">
              {article.quantity}
            </div>

            <div className="flex items-center justify-center w-full tabular-nums text-muted-foreground dark:text-slate-400">
              ${Number(article.unit_price || 0).toFixed(2)}
            </div>

            <div className="flex items-center justify-center w-full text-[10px] text-muted-foreground dark:text-slate-400">
              {article.usa_tracking ?? '—'}
            </div>

            <div className="flex items-center justify-center w-full text-[10px] text-muted-foreground dark:text-slate-400">
              {article.ock_tracking ?? '—'}
            </div>

            <div className="flex items-center justify-center w-full gap-1 text-[10px] text-muted-foreground dark:text-slate-400 min-w-0">
              <MapPin className="size-3 opacity-50 shrink-0" />

              <span className="truncate">
                {article.article_location ?? 'Pendiente'}
              </span>
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}