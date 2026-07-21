"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useGetArticleTimeline } from "@/hooks/supervisor/useSupervisorGeneralArticles"
import { cn } from "@/lib/utils"
import type { SupervisorGeneralArticle, TimelineEvent, TimelineEventType } from "@/types/supervisor"
import {
    History,
    Loader2,
    Merge,
    PackageMinus,
    PackagePlus,
    PencilLine,
    Receipt,
} from "lucide-react"
import { dependencyBadgeCls, formatSupervisorDateTime } from "./utils/uiHelpers"

const TYPE_META: Record<TimelineEventType, { icon: React.ElementType; label: string }> = {
    AUDIT: { icon: PencilLine, label: "Edición" },
    INTAKE: { icon: PackagePlus, label: "Entrada" },
    COST: { icon: Receipt, label: "Costo" },
    DISPATCH: { icon: PackageMinus, label: "Despacho" },
    MERGE: { icon: Merge, label: "Fusión" },
}

/** Nombres legibles de los campos que aparecen en el detalle de una edición. */
const FIELD_LABELS: Record<string, string> = {
    description: "Descripción",
    brand_model: "Marca / Modelo",
    variant_type: "Variante",
    quantity: "Cantidad",
    minimum_quantity: "Cantidad mínima",
    primary_unit_id: "Unidad",
    merged_into_id: "Fusionado en",
}

/**
 * Recorrido completo de un artículo general: ediciones auditadas, entradas de
 * compra, ajustes de costo, despachos y fusiones, unificados por el backend en
 * una sola línea de tiempo descendente.
 */
export function ArticleTimelineDialog({
    open,
    onOpenChange,
    article,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    article: SupervisorGeneralArticle | null
}) {
    const { data, isLoading } = useGetArticleTimeline(open ? (article?.id ?? null) : null)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-border/60 pb-4">
                    <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2.5">
                        <History className="size-5 text-muted-foreground/70" />
                        Recorrido del artículo
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {article?.description}
                        {article?.brand_model ? ` · ${article.brand_model}` : ""}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    {isLoading && (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="size-5 animate-spin" />
                        </div>
                    )}

                    {!isLoading && (data?.events.length ?? 0) === 0 && (
                        <div className="flex flex-col items-center gap-1.5 py-12 text-muted-foreground/60 select-none">
                            <History className="size-4 opacity-60" />
                            <span className="text-[11px] tracking-widest uppercase">
                                Sin movimientos registrados
                            </span>
                            <span className="text-xs text-muted-foreground/50 max-w-sm text-center mt-1">
                                El rastro de ediciones comenzó a registrarse a partir de la puesta
                                en marcha del módulo de supervisión.
                            </span>
                        </div>
                    )}

                    {!isLoading && (data?.events.length ?? 0) > 0 && (
                        <div className="flex flex-col">
                            {data!.events.map((event, index) => (
                                <TimelineRow
                                    key={index}
                                    event={event}
                                    isLast={index === data!.events.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function TimelineRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
    const meta = TYPE_META[event.type] ?? TYPE_META.AUDIT
    const Icon = meta.icon

    return (
        <div className="flex gap-3">
            {/* Rail: icono + línea de continuidad */}
            <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center justify-center size-8 rounded-full border border-sky-400/40 bg-sky-500/[0.08] dark:border-sky-300/25">
                    <Icon className="size-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                {!isLast && <div className="w-px flex-1 bg-border/50 my-1" />}
            </div>

            <div className={cn("min-w-0 flex-1", isLast ? "pb-1" : "pb-4")}>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{meta.label}</span>
                    <span className={dependencyBadgeCls()}>{event.event}</span>
                    {event.context && (
                        <span className="text-[11px] text-muted-foreground/70">
                            {event.context}
                        </span>
                    )}
                </div>

                <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {formatSupervisorDateTime(event.date)}
                    {event.by ? ` · ${event.by}` : ""}
                </div>

                <EventDetail event={event} />
            </div>
        </div>
    )
}

function EventDetail({ event }: { event: TimelineEvent }) {
    const detail = event.detail

    if (!detail) return null

    // Ediciones: se muestra campo por campo el antes → después.
    if (event.type === "AUDIT") {
        const oldValues = (detail.old ?? {}) as Record<string, unknown>
        const newValues = (detail.new ?? {}) as Record<string, unknown>
        const fields = Array.from(
            new Set([...Object.keys(oldValues), ...Object.keys(newValues)]),
        )

        if (fields.length === 0) return null

        return (
            <div className="mt-1.5 flex flex-col gap-1 rounded-lg border border-border/50 bg-background/70 px-2.5 py-1.5">
                {fields.map((field) => (
                    <div key={field} className="flex items-center gap-2 text-xs min-w-0">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 shrink-0 w-24 select-none">
                            {FIELD_LABELS[field] ?? field}
                        </span>
                        <span className="text-muted-foreground/60 line-through truncate max-w-[38%]">
                            {formatValue(oldValues[field])}
                        </span>
                        <span className="text-muted-foreground/40 shrink-0">→</span>
                        <span className="font-medium truncate">{formatValue(newValues[field])}</span>
                    </div>
                ))}
            </div>
        )
    }

    const pairs = Object.entries(detail).filter(([, value]) => value !== null && value !== undefined)

    if (pairs.length === 0) return null

    return (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
            {pairs.map(([key, value]) => (
                <span key={key} className={dependencyBadgeCls()}>
                    {DETAIL_LABELS[key] ?? key}: {formatValue(value)}
                </span>
            ))}
        </div>
    )
}

const DETAIL_LABELS: Record<string, string> = {
    quantity: "Cantidad",
    cost: "Costo",
    unit: "Unidad",
    old_cost: "Costo anterior",
    new_cost: "Costo nuevo",
    merge_id: "Fusión",
    absorbed_count: "Absorbidos",
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—"
    if (typeof value === "number") return String(value)

    return String(value)
}
