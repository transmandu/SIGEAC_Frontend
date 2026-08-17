"use client"

import { formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveGeneralArticleRequisition } from "@/types/purchase"

const STATUS_LABELS: Record<string, string> = {
  CREATED: "CREADA",
  RECEIVED: "RECIBIDA",
  IN_PROGRESS: "EN PROCESO",
  QUOTED: "COTIZADA",
}

/** `compact` es la variante en línea del formulario; la extendida va en el diálogo. */
export function ActiveRequisitionWarning({
  entries,
  compact = false,
  className,
}: {
  entries: ActiveGeneralArticleRequisition[]
  compact?: boolean
  className?: string
}) {
  if (entries.length === 0) return null

  const total = entries.reduce((sum, entry) => sum + Number(entry.quantity ?? 0), 0)
  // Sumar 1 GALON + 3 METRO no significa nada: solo hay total si la unidad es una sola.
  const units = Array.from(new Set(entries.map((entry) => entry.unit_label ?? "")))
  const sharedUnit = units.length === 1 ? units[0] : null

  const describeAge = (createdAt: string) => {
    try {
      return formatDistanceToNow(parseISO(createdAt), { locale: es, addSuffix: true })
    } catch {
      return null
    }
  }

  return (
    <div
      className={cn(
        "rounded-md border border-amber-500/40 bg-amber-500/[0.07] px-2.5 py-2",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-500 mt-px" />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {sharedUnit !== null
              ? `Ya se solicitaron ${total} ${sharedUnit} recientemente`
              : "Este artículo ya fue solicitado recientemente"}
            {entries.length > 1 && ` en ${entries.length} solicitudes`}
          </p>

          <ul className="flex flex-col gap-0.5">
            {entries.map((entry) => {
              const age = describeAge(entry.created_at)
              const requester = entry.created_by === "SYSTEM"
                ? "alerta de stock"
                : entry.requested_by

              return (
                <li
                  key={`${entry.order_number}-${entry.description}-${entry.variant_type ?? ""}`}
                  className="text-[11px] text-muted-foreground"
                >
                  <span className="tabular-nums font-medium text-foreground/80">
                    {entry.quantity} {entry.unit_label ?? ""}
                  </span>
                  {" · "}
                  <span className="font-medium">{entry.order_number}</span>
                  {STATUS_LABELS[entry.order_status] && ` · ${STATUS_LABELS[entry.order_status]}`}
                  {!compact && requester && ` · ${requester}`}
                  {age && ` · ${age}`}
                </li>
              )
            })}
          </ul>

          {!compact && (
            <p className="text-[11px] text-muted-foreground/80">
              Puede continuar si la situación lo amerita.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
