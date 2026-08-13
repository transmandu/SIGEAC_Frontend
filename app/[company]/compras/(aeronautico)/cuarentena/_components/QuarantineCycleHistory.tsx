'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { QuarantineCycle } from '@/types/quarantine'
import { CheckCircle2, CircleDot, MessageSquare, ShieldX, Wrench } from 'lucide-react'

const formatDateTime = (value?: string | null) => {
  if (!value) return null

  // Los ciclos guardan momentos, no días: aquí sí interesa la hora, y el ISO
  // que envía el backend se interpreta bien de forma nativa.
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const OutcomeBadge = ({ outcome }: { outcome: QuarantineCycle['outcome'] }) => {
  if (!outcome) {
    return (
      <Badge className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700 shadow-sm dark:text-amber-300">
        En curso
      </Badge>
    )
  }

  const approved = outcome === 'APPROVED'

  return (
    <Badge
      className={cn(
        'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
        approved
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
      )}
    >
      {approved ? 'Aprobado' : 'Rechazado'}
    </Badge>
  )
}

/**
 * El ida y vuelta completo sobre una misma retención. Importa mostrarlo entero
 * y no solo el motivo vigente: un artículo que ya falló dos veces exige una
 * corrección distinta a la que se intentó, y esa es la evidencia de reincidencia
 * que la normativa pide poder demostrar.
 */
export function QuarantineCycleHistory({ cycles }: { cycles: QuarantineCycle[] }) {
  if (cycles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-muted-foreground dark:border-slate-700">
        Sin historial registrado.
      </p>
    )
  }

  const ordered = [...cycles].sort((a, b) => b.cycle_number - a.cycle_number)

  return (
    <div className="space-y-3">
      {ordered.map((cycle) => {
        const reported = formatDateTime(cycle.reported_at)
        const resolved = formatDateTime(cycle.resolved_at)
        const closed = formatDateTime(cycle.outcome_at)

        return (
          <div
            key={cycle.id}
            className="rounded-xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700/60 dark:bg-slate-900/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {cycle.cycle_number}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cycle.cycle_number === 1 ? 'Retención original' : `Reincidencia ${cycle.cycle_number - 1}`}
                </span>
              </div>
              <OutcomeBadge outcome={cycle.outcome} />
            </div>

            <div className="mt-3 space-y-3">
              {/* Hallazgo del inspector */}
              <div className="flex gap-2.5">
                <ShieldX className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Hallazgo de calidad
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{cycle.reason}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[cycle.reported_by, reported].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
              </div>

              {/* Corrección de compras */}
              {cycle.resolution_notes ? (
                <div className="flex gap-2.5">
                  <Wrench className="mt-0.5 size-3.5 shrink-0 text-sky-500" />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Corrección de compras
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{cycle.resolution_notes}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {[cycle.resolved_by, resolved].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <CircleDot className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" />
                  <p className="text-[11px] italic text-muted-foreground">
                    Sin corrección registrada todavía.
                  </p>
                </div>
              )}

              {/* Veredicto de la re-inspección */}
              {cycle.outcome && (
                <div className="flex gap-2.5">
                  {cycle.outcome === 'APPROVED' ? (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                  )}
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Veredicto de re-inspección
                    </p>
                    {cycle.outcome_notes && (
                      <p className="text-sm text-slate-800 dark:text-slate-200">{cycle.outcome_notes}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {[cycle.outcome_by, closed].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
