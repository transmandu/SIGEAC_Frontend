'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Handshake,
  Link2,
  Package,
  Truck,
  User,
  UserCog,
  Warehouse,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import { isAeronauticalPurchaseOrder } from '@/lib/purchases/purchase-order-scope'
import type {
  PurchaseOrder,
  PurchaseOrderArticle,
  PurchaseOrderGeneralArticle,
} from '@/types/purchase/purchase-order'

// Destino del intake, derivado de cuál referencia venga poblada (excluyentes
// entre sí): almacén para el flujo normal, o la entidad de una entrega directa.
const getIntakeDestination = (intake: NonNullable<PurchaseOrderGeneralArticle['general_article_intake']>) => {
  if (intake.warehouse) {
    return { label: intake.warehouse.name, type: 'Almacén', Icon: Warehouse }
  }
  if (intake.department) {
    return { label: intake.department.name, type: 'Departamento', Icon: Building2 }
  }
  if (intake.employee) {
    return {
      label: `${intake.employee.first_name} ${intake.employee.last_name}`,
      type: 'Empleado',
      Icon: User,
    }
  }
  if (intake.authorized_employee) {
    return { label: intake.authorized_employee.full_name, type: 'Solicitante autorizado', Icon: UserCog }
  }
  if (intake.third_party) {
    return { label: intake.third_party.name, type: 'Tercero', Icon: Handshake }
  }
  return null
}

interface Props {
  purchaseOrder: PurchaseOrder | null
  onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  PAID: 'PAGADA',
  COMPLETED: 'COMPLETADA',
}

const statusLabel = (status?: string) => STATUS_LABELS[status ?? ''] ?? status ?? '—'

const statusBadgeClass = (status?: string) => {
  const paid = status === 'PAID'
  const completed = status === 'COMPLETED'

  return cn(
    'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
    paid && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    completed && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    !paid && !completed && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
  )
}

const INTAKE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Por confirmar',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  DELIVERED: 'Entregada',
}

const intakeBadgeClass = (status?: string) => {
  const confirmed = status === 'CONFIRMED'
  const rejected = status === 'REJECTED'
  const delivered = status === 'DELIVERED'

  return cn(
    'h-4 px-1.5 text-[9px] font-semibold uppercase tracking-wide shrink-0 border shadow-none transition-colors duration-150 cursor-default',
    confirmed && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15',
    rejected && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15',
    delivered && 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15',
    !confirmed && !rejected && !delivered && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15'
  )
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

// ── Artículo de batch (aeronáutico) ────────────────────────────────────────
const BatchArticleRow = ({ article, isCompleted }: { article: PurchaseOrderArticle; isCompleted: boolean }) => {
  const [expanded, setExpanded] = useState(false)
  const quoteArticle = article.article_quote_order
  const req = quoteArticle?.article_requisition_order
  const batchName = req?.batch?.name ?? 'Sin lote'
  const batchCategory = req?.batch?.category
  const unitLabel = quoteArticle?.unit?.label ?? req?.unit?.label
  const conditionName = quoteArticle?.condition?.name
  const vendorName = quoteArticle?.vendor?.name

  const quotedTotal = quoteArticle?.total != null
    ? Number(quoteArticle.total)
    : Number(quoteArticle?.quantity || 0) * Number(quoteArticle?.unit_price || 0)
  const amount = article.total != null ? Number(article.total) : quotedTotal
  const totalDiffers = article.total != null && Number(article.total) !== quotedTotal

  const emptyLabel = (value?: string | number | null) => {
    if (value != null && value !== '') return String(value)
    return isCompleted ? 'N/A' : '—'
  }

  return (
    <div className="rounded-md border border-border/60 bg-background/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-2 px-3 pt-3 pb-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <span className="block text-sm font-semibold leading-snug break-words">
            {batchName}
          </span>

          {batchCategory && (
            <span className="inline-block shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/80">
              {batchCategory}
            </span>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="shrink-0 text-[9px] px-1.5 py-[2px] rounded bg-teal-500/10 text-teal-700 border border-teal-500/20 font-medium select-none">
              P/N
            </span>
            <span className="text-[13px] font-medium text-foreground/90 break-words">
              {req?.article_part_number ?? 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">Total</span>
          <span className="text-sm font-semibold tabular-nums">{money(amount)}</span>
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-muted-foreground/60">
            Cant. <span className="font-medium tabular-nums text-foreground/80">{quoteArticle?.quantity ?? '—'}</span>{' '}
            {unitLabel ?? ''}
          </span>
          <span className="text-muted-foreground/60">
            P/U <span className="font-medium tabular-nums text-foreground/80">{money(quoteArticle?.unit_price)}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[#2f716f] dark:text-[#6fc2bf] hover:bg-[#439A97]/10 transition-colors"
        >
          Detalles
          <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/50 bg-muted/10 px-3 py-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <span className="text-muted-foreground/70">
              P/N Alterno: <span className="text-foreground/80">{emptyLabel(req?.article_alt_part_number)}</span>
            </span>
            <span className="text-muted-foreground/70">
              Proveedor: <span className="text-foreground/80">{emptyLabel(vendorName)}</span>
            </span>
            <span className="text-muted-foreground/70">
              Condición: <span className="text-foreground/80">{emptyLabel(conditionName)}</span>
            </span>
            {totalDiffers && (
              <span className="text-amber-600 dark:text-amber-400">
                Cotizado: <span className="font-medium">{money(quotedTotal)}</span>
              </span>
            )}
            <span className="text-muted-foreground/70">
              Tracking Nacional: <span className="font-mono text-foreground/80">{emptyLabel(article.shipping_tracking)}</span>
            </span>
            <span className="text-muted-foreground/70">
              Tracking Int&apos;l: <span className="font-mono text-foreground/80">{emptyLabel(article.international_shipping_tracking)}</span>
            </span>
          </div>

          {quoteArticle?.justification && (
            <div className="border-t border-border/50 pt-2">
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                Justificación
              </span>
              <p className="text-xs text-foreground/80 leading-snug">{quoteArticle.justification}</p>
            </div>
          )}

          {article.total_justification && (
            <div className="border-t border-amber-500/30 pt-2">
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-0.5">
                Justificación de diferencia de total
              </span>
              <p className="text-xs text-foreground/80 leading-snug">{article.total_justification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Artículo general ────────────────────────────────────────────────────────
const GeneralArticleRow = ({ article, isCompleted }: { article: PurchaseOrderGeneralArticle; isCompleted: boolean }) => {
  const [expanded, setExpanded] = useState(false)
  const quoteArticle = article.general_article_quote_order
  const req = quoteArticle?.general_article_requisition_order
  const unitLabel = quoteArticle?.unit?.label ?? req?.unit?.label
  const intake = article.general_article_intake
  const intakeStatus = intake?.status
  const intakeDestination = intake ? getIntakeDestination(intake) : null

  const quotedTotal = quoteArticle?.total != null
    ? Number(quoteArticle.total)
    : Number(quoteArticle?.quantity || 0) * Number(quoteArticle?.unit_price || 0)
  const amount = article.total != null ? Number(article.total) : quotedTotal
  const totalDiffers = article.total != null && Number(article.total) !== quotedTotal

  const emptyLabel = (value?: string | number | null) => {
    if (value != null && value !== '') return String(value)
    return isCompleted ? 'N/A' : '—'
  }

  return (
    <div className="rounded-md border border-border/60 bg-background/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-2 px-3 pt-3 pb-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold leading-snug break-words">
              {req?.description ?? 'Artículo'}
            </span>
            <Badge className={intakeBadgeClass(intakeStatus)}>
              {intakeStatus ? INTAKE_STATUS_LABELS[intakeStatus] ?? intakeStatus : 'Sin entrega'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">Total</span>
          <span className="text-sm font-semibold tabular-nums">{money(amount)}</span>
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-muted-foreground/60">
            Cant. <span className="font-medium tabular-nums text-foreground/80">{quoteArticle?.quantity ?? '—'}</span>{' '}
            {unitLabel ?? ''}
          </span>
          <span className="text-muted-foreground/60">
            P/U <span className="font-medium tabular-nums text-foreground/80">{money(quoteArticle?.unit_price)}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[#2f716f] dark:text-[#6fc2bf] hover:bg-[#439A97]/10 transition-colors"
        >
          Detalles
          <ChevronDown className={cn('size-3 transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/50 bg-muted/10 px-3 py-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <span className="text-muted-foreground/70">
              Present. / Especif.: <span className="text-foreground/80">{emptyLabel(req?.variant_type)}</span>
            </span>
            <span className="text-muted-foreground/70">
              Marca / Modelo: <span className="text-foreground/80">{emptyLabel(quoteArticle?.brand_model)}</span>
            </span>
            <span className="text-muted-foreground/70">
              Lugar de compra: <span className="text-foreground/80">{emptyLabel(quoteArticle?.retailer?.name)}</span>
            </span>
            {intakeDestination && (
              <span className="text-muted-foreground/70 flex items-center gap-1">
                <intakeDestination.Icon className="size-3 shrink-0 opacity-70" />
                {intakeDestination.type}: <span className="text-foreground/80">{intakeDestination.label}</span>
              </span>
            )}
            {totalDiffers && (
              <span className="text-amber-600 dark:text-amber-400">
                Cotizado: <span className="font-medium">{money(quotedTotal)}</span>
              </span>
            )}
            <span className="text-muted-foreground/70">
              Tracking Nacional: <span className="font-mono text-foreground/80">{emptyLabel(article.shipping_tracking)}</span>
            </span>
            <span className="text-muted-foreground/70">
              Tracking Int&apos;l: <span className="font-mono text-foreground/80">{emptyLabel(article.international_shipping_tracking)}</span>
            </span>
          </div>

          {quoteArticle?.justification && (
            <div className="border-t border-border/50 pt-2">
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                Justificación
              </span>
              <p className="text-xs text-foreground/80 leading-snug">{quoteArticle.justification}</p>
            </div>
          )}

          {article.total_justification && (
            <div className="border-t border-amber-500/30 pt-2">
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-0.5">
                Justificación de diferencia de total
              </span>
              <p className="text-xs text-foreground/80 leading-snug">{article.total_justification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PurchaseOrderPreviewPanel({ purchaseOrder, onClose }: Props) {
  const { selectedCompany } = useCompanyStore()

  if (!purchaseOrder) return null

  const isAeronautical = isAeronauticalPurchaseOrder(purchaseOrder)
  const isCompleted = purchaseOrder.status === 'COMPLETED'

  const articles = purchaseOrder.article_purchase_order ?? []
  const generalArticles = purchaseOrder.general_article_purchase_order ?? []
  const totalArticles = articles.length + generalArticles.length
  const hasArticles = totalArticles > 0

  const quoteSegment = isAeronautical ? 'cotizaciones' : 'cotizaciones_generales'
  const placeLabel = isAeronautical ? purchaseOrder.vendor?.name : purchaseOrder.retailer?.name

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold truncate">{purchaseOrder.order_number}</span>
            <Badge className={statusBadgeClass(purchaseOrder.status)}>{statusLabel(purchaseOrder.status)}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            Resumen de la orden de compra y sus artículos.
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
              label={isAeronautical ? 'PROVEEDOR' : 'LUGAR DE COMPRA'}
              value={placeLabel}
              icon={Truck}
            />
            <MetaItem label="CREADO POR" value={purchaseOrder.created_by?.toUpperCase?.() ?? purchaseOrder.created_by} icon={User} />
            <MetaItem
              label="FECHA DE COMPRA"
              value={purchaseOrder.purchase_date
                ? new Date(purchaseOrder.purchase_date).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
                : undefined}
              icon={CalendarDays}
            />
            <MetaItem
              label="COTIZACIÓN ORIGEN"
              value={purchaseOrder.quote_order?.quote_number}
              icon={Package}
            />
          </div>

          {purchaseOrder.quote_order?.quote_number && selectedCompany?.slug && (
            <Link
              href={`/${selectedCompany.slug}/compras/${quoteSegment}/${purchaseOrder.quote_order.quote_number}`}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2f716f] dark:text-[#6fc2bf] hover:underline underline-offset-2"
            >
              <Link2 className="size-3.5" />
              Ver cotización de origen
            </Link>
          )}
        </div>

        {/* ── Observación ─────────────────────────────────── */}
        {purchaseOrder.observation && (
          <div className="rounded-md border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-3">
            <div className="flex items-center gap-2 mb-2 select-none">
              <FileText className="size-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                OBSERVACIÓN
              </span>
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{purchaseOrder.observation}</p>
          </div>
        )}

        {/* ── Artículos ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2 select-none">
            <span className="text-xs font-semibold tracking-wide text-foreground/90">
              ARTÍCULOS
            </span>
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5">
              <span className="text-[9px] tracking-wider text-muted-foreground">TOTAL</span>
              <span className="text-xs font-semibold tabular-nums">{totalArticles}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {articles.map((article) => (
              <BatchArticleRow key={article.id} article={article} isCompleted={isCompleted} />
            ))}

            {generalArticles.map((article) => (
              <GeneralArticleRow key={article.id} article={article} isCompleted={isCompleted} />
            ))}

            {!hasArticles && (
              <p className="text-sm text-muted-foreground italic text-center px-2 py-3">
                Esta orden de compra no posee artículos asociados.
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
            {money(purchaseOrder.total)}
          </span>
        </div>
      </div>
    </div>
  )
}
