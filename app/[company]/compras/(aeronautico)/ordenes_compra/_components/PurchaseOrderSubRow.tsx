'use client'

import { Row } from '@tanstack/react-table'
import { Boxes } from 'lucide-react'

import type { PurchaseOrder } from '@/types/purchase'
import PurchaseOrderArticleCard from '../[order_number]/_components/PurchaseOrderArticleCard'

const money = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0)
  return `$${n.toFixed(2)}`
}

export default function PurchaseOrderSubRow({
  row,
}: {
  row: Row<PurchaseOrder>
}) {
  const po = row.original
  const articles = po.article_purchase_order ?? []
  const totalArticles = articles.length

  if (totalArticles === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-[11px] text-muted-foreground/60 italic">
          Sin artículos registrados
        </p>
      </div>
    )
  }

  const grandTotal = articles.reduce((sum, item) => {
    const quoteArticle = item.article_quote_order
    const quotedTotal = quoteArticle?.total != null
      ? Number(quoteArticle.total)
      : Number(quoteArticle?.quantity || 0) * Number(quoteArticle?.unit_price || 0)
    return sum + (item.total != null ? Number(item.total) : quotedTotal)
  }, 0)

  return (
    <div className="px-4 py-3 space-y-3">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground select-none">
          <Boxes className="size-3.5 opacity-60" />
          <span className="font-medium text-foreground/80">{totalArticles}</span>
          {totalArticles === 1 ? 'artículo' : 'artículos'}
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 px-2 py-0.5">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Subtotal</span>
          <span className="text-xs font-semibold tabular-nums">{money(grandTotal)}</span>
        </div>
      </div>

      {/* ARTÍCULOS */}
      <div
        className="
          grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2
          items-start
          max-h-[420px] overflow-y-auto pr-1
        "
      >
        {articles.map((article) => (
          <PurchaseOrderArticleCard key={article.id} article={article} orderStatus={po.status} />
        ))}
      </div>

    </div>
  )
}
