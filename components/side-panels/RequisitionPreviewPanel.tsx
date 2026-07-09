'use client'

import {
  Plane,
  FileText,
  MessageSquare,
  UserCheck,
  UserPlus,
  CalendarDays,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatRequestedDate } from '@/lib/utils'
import type { Requisition } from '@/types/purchase'

interface Props {
  requisition: Requisition | null
  onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'CREADA',
  RECEIVED: 'RECIBIDA',
  IN_PROGRESS: 'EN PROCESO',
  QUOTED: 'COTIZADA',
  APPROVED: 'APROBADA',
  REJECTED: 'RECHAZADA',
}

const statusLabel = (status?: string) => STATUS_LABELS[status ?? ''] ?? status ?? '—'

const statusBadgeClass = (status?: string) => {
  const created = status === 'CREATED'
  const received = status === 'RECEIVED'
  const process = status === 'IN_PROGRESS' || status === 'QUOTED'
  const approved = status === 'APPROVED'

  return cn(
    'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
    created && 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    received && 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    process && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    approved && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    !created && !received && !process && !approved && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
  )
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'BAJA',
  MEDIUM: 'MEDIA',
  HIGH: 'ALTA',
}

const priorityBadgeClass = (priority?: string) =>
  cn(
    'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide',
    priority === 'LOW' && 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
    priority === 'MEDIUM' && 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    priority === 'HIGH' && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
    !priority && 'border-slate-500/30 bg-slate-500/10 text-slate-400'
  )

interface MetaItemProps {
  label: string
  value?: string | null
  icon?: typeof UserCheck
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

interface DetailChipProps {
  label: string
  value: string | number
}

interface DestinationEntry {
  key: string
  label: string
  value: string
}

interface ArticleRowProps {
  title: string
  typeBadge?: string
  details: DetailChipProps[]
  destinations: DestinationEntry[]
  quantity: string | number
  unit: string
}

const ArticleRow = ({
  title,
  typeBadge,
  details,
  destinations,
  quantity,
  unit,
}: ArticleRowProps) => (
  <div className="rounded-md border border-border/60 bg-background/80">
    {/* ── Nivel 1: título + detalles ───────────────────── */}
    <div className="flex flex-col gap-1 px-3 pt-3 pb-2.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-snug break-words">{title}</span>
        {typeBadge && (
          <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/80">
            {typeBadge}
          </span>
        )}
      </div>

      {details.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {details.map((d) => (
            <span key={d.label} className="text-[11px] text-muted-foreground">
              {d.label}: <span className="text-foreground/70">{d.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>

    {/* ── Nivel 2: destinos ─────────────────────────────── */}
    {destinations.length > 0 && (
      <div className="flex flex-col gap-1 border-t border-border/50 px-3 py-2">
        {destinations.map(({ key, label, value }) => (
          <div key={key} className="flex items-baseline gap-1.5 text-[11px]">
            <span className="shrink-0 text-muted-foreground/60">{label}:</span>
            <span className="text-foreground/80 break-words">{value}</span>
          </div>
        ))}
      </div>
    )}

    {/* ── Nivel 3: cantidad ─────────────────────────────── */}
    <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
        Cantidad
      </span>
      <span className="text-sm font-semibold tabular-nums">
        {quantity}{' '}
        <span className="text-[11px] font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  </div>
)

export default function RequisitionPreviewPanel({ requisition, onClose }: Props) {
  if (!requisition) return null

  const batches = requisition.batch ?? []
  const generalArticles = requisition.general_articles ?? []
  const hasArticles =
    batches.some((batch: any) => batch.batch_articles?.length) ||
    generalArticles.length > 0

  const totalArticles =
    batches.reduce((acc: number, batch: any) => acc + (batch.batch_articles?.length ?? 0), 0) +
    generalArticles.length

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold truncate">{requisition.order_number}</span>
            <Badge className={statusBadgeClass(requisition.status)}>
              {statusLabel(requisition.status)}
            </Badge>
            {requisition.priority && (
              <Badge className={priorityBadgeClass(requisition.priority)}>
                {PRIORITY_LABELS[requisition.priority] ?? requisition.priority}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Resumen de la requisición y sus artículos.
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 size-7"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
        {/* ── Resumen ─────────────────────────────────────── */}
        <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <MetaItem
              label="CREADO POR"
              value={
                requisition.created_by
                  ? `${requisition.created_by.first_name} ${requisition.created_by.last_name}`.toUpperCase()
                  : undefined
              }
              icon={UserCheck}
            />
            <MetaItem
              label="SOLICITADO POR"
              value={requisition.requested_by?.toUpperCase()}
              icon={UserPlus}
            />
            <MetaItem
              label="FECHA DE SOLICITUD"
              value={formatRequestedDate(requisition.submission_date)}
              icon={CalendarDays}
            />
            {requisition.aircraft?.acronym && (
              <MetaItem
                label="AERONAVE"
                value={requisition.aircraft.acronym}
                icon={Plane}
              />
            )}
          </div>
        </div>

        {/* ── Justificación / Observación ─────────────────── */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-md border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-3">
            <div className="flex items-center gap-2 mb-2 select-none">
              <FileText className="size-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                JUSTIFICACIÓN
              </span>
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">
              {requisition.justification?.trim() || 'Sin justificación.'}
            </p>
          </div>

          {requisition.observation && (
            <div className="rounded-md border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-3">
              <div className="flex items-center gap-2 mb-2 select-none">
                <MessageSquare className="size-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                  OBSERVACIÓN
                </span>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {requisition.observation}
              </p>
            </div>
          )}
        </div>

        {/* ── Artículos ────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2 select-none">
            <span className="text-xs font-semibold tracking-wide text-foreground/90">
              ARTÍCULOS SOLICITADOS
            </span>
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5">
              <span className="text-[9px] tracking-wider text-muted-foreground">TOTAL</span>
              <span className="text-xs font-semibold tabular-nums">{totalArticles}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {batches.flatMap((batch: any, batchIndex: number) =>
              (batch.batch_articles ?? []).map((article: any, articleIndex: number) => {
                const acronym =
                  typeof article.aircraft === 'string'
                    ? article.aircraft
                    : article.aircraft?.acronym

                const details: DetailChipProps[] = [
                  { label: 'P/N', value: article.article_part_number ?? 'N/A' },
                ]

                if (article.article_alt_part_number) {
                  details.push({ label: 'Alt. P/N', value: article.article_alt_part_number })
                }

                const destinations: DestinationEntry[] = []

                if (requisition.requested_by) {
                  destinations.push({
                    key: 'requested_by',
                    label: 'Solicitante',
                    value: requisition.requested_by,
                  })
                }

                if (acronym) {
                  destinations.push({
                    key: 'aircraft',
                    label: 'Aeronave',
                    value: acronym,
                  })
                }

                return (
                  <ArticleRow
                    key={`batch-${batchIndex}-${articleIndex}`}
                    title={batch.name}
                    typeBadge={batch.category}
                    details={details}
                    destinations={destinations}
                    quantity={article.quantity ?? '-'}
                    unit={article.unit?.label ?? 'N/A'}
                  />
                )
              })
            )}

            {generalArticles.map((article: any) => {
              const details: DetailChipProps[] = []

              if (article.variant_type) {
                details.push({ label: 'Present. / Especif.', value: article.variant_type })
              }

              if (article.requested_date) {
                details.push({
                  label: 'Fecha solicitud',
                  value: formatRequestedDate(article.requested_date),
                })
              }

              const destinations: DestinationEntry[] = [
                article.department && {
                  key: 'department',
                  label: 'Departamento',
                  value: article.department.acronym ?? article.department.name,
                },
                article.third_party && {
                  key: 'third_party',
                  label: 'Tercero',
                  value: article.third_party.name,
                },
                article.employee && {
                  key: 'employee',
                  label: 'Solicitante',
                  value: `${article.employee.first_name} ${article.employee.last_name}`.trim(),
                },
                article.authorized_employee && {
                  key: 'authorized_employee',
                  label: 'Autorizado',
                  value:
                    article.authorized_employee.full_name ??
                    article.authorized_employee.dni_employee,
                },
              ].filter(Boolean) as DestinationEntry[]

              if (destinations.length === 0 && requisition.requested_by) {
                destinations.push({
                  key: 'requested_by',
                  label: 'Solicitante',
                  value: requisition.requested_by,
                })
              }

              return (
                <ArticleRow
                  key={`general-${article.id}`}
                  title={article.description ?? 'N/A'}
                  typeBadge="General"
                  details={details}
                  destinations={destinations}
                  quantity={article.quantity ?? '-'}
                  unit={article.unit?.label ?? 'N/A'}
                />
              )
            })}

            {!hasArticles && (
              <p className="text-sm text-muted-foreground italic text-center px-2 py-3">
                Esta requisición no posee artículos asociados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
