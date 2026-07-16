'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Ban,
  CalendarDays,
  ChevronDown,
  FileText,
  MapPin,
  MessageSquare,
  Scale,
  Truck,
  User,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  ArticleQuoteOrder,
  GeneralArticleQuoteOrder,
  Quote,
} from '@/types/purchase/quote'

interface Props {
  quote: Quote | null
  onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  APPROVED: 'APROBADA',
  REJECTED: 'RECHAZADA',
}

const statusLabel = (status?: string) => STATUS_LABELS[status ?? ''] ?? status ?? '—'

const statusBadgeClass = (status?: string) => {
  const pending = status === 'PENDING'
  const approved = status === 'APPROVED'

  return cn(
    'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
    pending && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    approved && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    !pending && !approved && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
  )
}

const formatDate = (date?: string | null) => {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const money = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0)
  return `$${n.toFixed(2)}`
}

interface MetaItemProps {
  label: string
  value?: string | null
  icon?: typeof User
}

const MetaItem = ({ label, value, icon: Icon }: MetaItemProps) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 select-none">
      {label}
    </span>
    <span className="text-sm font-medium flex items-center gap-1.5">
      {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0" />}
      {value ?? '—'}
    </span>
  </div>
)

// ── Comparativa: solicitado vs cotizado ────────────────────────────────────
interface CompareRowProps {
  label: string
  requested?: string | number | null
  quoted?: string | number | null
  changed: boolean
}

const CompareRow = ({ label, requested, quoted, changed }: CompareRowProps) => (
  <div className="flex items-center justify-between gap-2 text-[11px]">
    <span className="shrink-0 text-muted-foreground/70">{label}</span>
    {changed ? (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
        <span className="tabular-nums line-through opacity-60">{requested ?? '—'}</span>
        <ArrowRight className="size-2.5 shrink-0" />
        <span className="tabular-nums font-semibold">{quoted ?? '—'}</span>
      </div>
    ) : (
      <span className="tabular-nums font-medium text-foreground/80">{quoted ?? '—'}</span>
    )}
  </div>
)

// ── Artículo de batch (aeronáutico) ────────────────────────────────────────
const BatchArticleRow = ({ article }: { article: ArticleQuoteOrder }) => {
  const [expanded, setExpanded] = useState(false)
  const req = article.article_requisition_order
  const isNotQuoted = !!article.is_not_quoted
  const amount = article.quantity * Number(article.unit_price)

  const quantityChanged = req != null && Number(req.quantity) !== Number(article.quantity)
  const unitChanged =
    req?.unit?.label != null &&
    article.unit?.label != null &&
    req.unit.label !== article.unit.label
  const hasComparison = req != null && (quantityChanged || unitChanged)

  return (
    <div className="rounded-md border border-border/60 bg-background/80 overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2.5">
        <div className="min-w-0 flex-1 space-y-1">
          {/* Protagonista 1: lote (batch.name) — línea propia */}
          <span className="block text-sm font-semibold leading-snug break-words">
            {req?.batch?.name ?? 'SIN LOTE'}
          </span>

          {/* Badges de contexto del lote — línea propia, no comparte con el nombre */}
          {(req?.batch?.category || isNotQuoted) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {req?.batch?.category && (
                <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/80">
                  {req.batch.category}
                </span>
              )}
              {isNotQuoted && (
                <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  <Ban className="size-2.5" />
                  No cotizado
                </span>
              )}
            </div>
          )}

          {/* Protagonista 2: P/N — línea propia */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="shrink-0 text-[9px] px-1.5 py-[2px] rounded bg-teal-500/10 text-teal-700 border border-teal-500/20 font-medium select-none">
              P/N
            </span>
            <span className="text-[13px] font-medium text-foreground/90 break-words">
              {req?.article_part_number ?? 'N/A'}
            </span>
          </div>

          {req?.article_alt_part_number && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="shrink-0 text-[9px] px-1.5 py-[2px] rounded bg-slate-500/10 text-slate-600 border border-slate-500/20 font-medium select-none">
                ALT
              </span>
              <span className="text-[11px] text-muted-foreground break-words">
                {req.article_alt_part_number}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>
              Proveedor: <span className="text-foreground/70">{article.vendor?.name ?? '—'}</span>
            </span>
            {article.condition?.name && (
              <span>
                Condición: <span className="text-foreground/70">{article.condition.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">Total</span>
          <span className="text-sm font-semibold tabular-nums">{money(amount)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-muted-foreground/60">
            Cant. <span className="font-medium tabular-nums text-foreground/80">{article.quantity}</span>{' '}
            {article.unit?.label ?? ''}
          </span>
          <span className="text-muted-foreground/60">
            P/U <span className="font-medium tabular-nums text-foreground/80">{money(article.unit_price)}</span>
          </span>
        </div>

        {hasComparison && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors"
          >
            <Scale className="size-3" />
            Ver comparativa
            <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>

      {expanded && hasComparison && (
        <div className="border-t border-amber-500/30 bg-amber-50/40 dark:bg-amber-900/10 px-3 py-2 space-y-1.5">
          <span className="block text-[9px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
            Solicitado vs. cotizado
          </span>
          <CompareRow
            label="Cantidad"
            requested={req?.quantity}
            quoted={article.quantity}
            changed={quantityChanged}
          />
          <CompareRow
            label="Unidad"
            requested={req?.unit?.label}
            quoted={article.unit?.label}
            changed={unitChanged}
          />
        </div>
      )}
    </div>
  )
}

// ── Artículo general ────────────────────────────────────────────────────────
const GeneralArticleRow = ({ article }: { article: GeneralArticleQuoteOrder }) => {
  const [expanded, setExpanded] = useState(false)
  const req = article.general_article_requisition_order
  const isNotQuoted = !!article.is_not_quoted
  const amount = article.quantity * Number(article.unit_price)

  const quantityChanged = req != null && Number(req.quantity) !== Number(article.quantity)
  const unitChanged =
    req?.unit?.label != null &&
    article.unit?.label != null &&
    req.unit.label !== article.unit.label
  const hasComparison = req != null && (quantityChanged || unitChanged)

  return (
    <div className="rounded-md border border-border/60 bg-background/80 overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2.5">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold leading-snug break-words">
              {req?.description ?? 'N/A'}
            </span>
            {isNotQuoted && (
              <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                <Ban className="size-2.5" />
                No cotizado
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {req?.variant_type && (
              <span>
                Present. / Especif.: <span className="text-foreground/70">{req.variant_type}</span>
              </span>
            )}
            <span>
              Lugar de compra: <span className="text-foreground/70">{article.retailer?.name ?? '—'}</span>
            </span>
            {article.brand_model && (
              <span>
                Marca: <span className="text-foreground/70">{article.brand_model}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">Total</span>
          <span className="text-sm font-semibold tabular-nums">{money(amount)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-muted-foreground/60">
            Cant. <span className="font-medium tabular-nums text-foreground/80">{article.quantity}</span>{' '}
            {article.unit?.label ?? ''}
          </span>
          <span className="text-muted-foreground/60">
            P/U <span className="font-medium tabular-nums text-foreground/80">{money(article.unit_price)}</span>
          </span>
        </div>

        {hasComparison && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors"
          >
            <Scale className="size-3" />
            Ver comparativa
            <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>

      {expanded && hasComparison && (
        <div className="border-t border-amber-500/30 bg-amber-50/40 dark:bg-amber-900/10 px-3 py-2 space-y-1.5">
          <span className="block text-[9px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
            Solicitado vs. cotizado
          </span>
          <CompareRow
            label="Cantidad"
            requested={req?.quantity}
            quoted={article.quantity}
            changed={quantityChanged}
          />
          <CompareRow
            label="Unidad"
            requested={req?.unit?.label}
            quoted={article.unit?.label}
            changed={unitChanged}
          />
        </div>
      )}
    </div>
  )
}

export default function QuotePreviewPanel({ quote, onClose }: Props) {
  if (!quote) return null

  const articles = quote.article_quote_order ?? []
  const generalArticles = quote.general_article_quote_order ?? []
  const totalArticles = articles.length + generalArticles.length
  const hasArticles = totalArticles > 0

  const vendorNames = Array.from(
    new Set(
      [quote.vendor?.name, ...articles.map((a) => a.vendor?.name)].filter(
        (name): name is string => !!name
      )
    )
  )
  const retailerNames = Array.from(
    new Set(
      [quote.retailer?.name, ...generalArticles.map((a) => a.retailer?.name)].filter(
        (name): name is string => !!name
      )
    )
  )
  const placeLabel = vendorNames.length > 0 ? vendorNames.join(', ') : retailerNames.join(', ')

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold truncate">{quote.quote_number}</span>
            <Badge className={statusBadgeClass(quote.status)}>{statusLabel(quote.status)}</Badge>
            {quote.parent_quote_order && (
              <span className="rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                Complementaria
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Resumen de la cotización y sus artículos.
          </span>
        </div>

        <Button variant="ghost" size="icon" className="shrink-0 size-7" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
        {/* ── Resumen ─────────────────────────────────────── */}
        <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <MetaItem
              label={vendorNames.length > 0 ? 'PROVEEDOR' : 'LUGAR DE COMPRA'}
              value={placeLabel || undefined}
              icon={Truck}
            />
            <MetaItem label="CREADO POR" value={quote.created_by?.toUpperCase?.() ?? quote.created_by} icon={User} />
            <MetaItem label="FECHA DE COTIZACIÓN" value={formatDate(quote.quote_date)} icon={CalendarDays} />
            <MetaItem
              label="REQUISICIÓN ORIGEN"
              value={quote.requisition_order?.order_number}
              icon={MapPin}
            />
          </div>
        </div>

        {/* ── Observación ─────────────────────────────────── */}
        {quote.observation && (
          <div className="rounded-md border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-3">
            <div className="flex items-center gap-2 mb-2 select-none">
              <MessageSquare className="size-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                OBSERVACIÓN
              </span>
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{quote.observation}</p>
          </div>
        )}

        {/* ── Artículos ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2 select-none">
            <span className="text-xs font-semibold tracking-wide text-foreground/90">
              ARTÍCULOS COTIZADOS
            </span>
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5">
              <span className="text-[9px] tracking-wider text-muted-foreground">TOTAL</span>
              <span className="text-xs font-semibold tabular-nums">{totalArticles}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {articles.map((article) => (
              <BatchArticleRow key={article.id} article={article} />
            ))}

            {generalArticles.map((article) => (
              <GeneralArticleRow key={article.id} article={article} />
            ))}

            {!hasArticles && (
              <p className="text-sm text-muted-foreground italic text-center px-2 py-3">
                Esta cotización no posee artículos asociados.
              </p>
            )}
          </div>
        </div>

        {/* ── Total general ──────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 rounded-md bg-muted/10 px-4 py-2.5 border border-border/40">
          <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground">
            <FileText className="size-3.5" />
            TOTAL GENERAL
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums leading-none">
            {money(quote.total)}
          </span>
        </div>
      </div>
    </div>
  )
}
