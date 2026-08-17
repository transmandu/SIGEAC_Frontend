"use client"

import { Badge } from "@/components/ui/badge"
import type { DuplicateCandidateGroup } from "@/types/supervisor"
import { ArrowRight, Ruler, ShieldCheck, Tags } from "lucide-react"
import SupervisorActionButton from "./SupervisorActionButton"
import { formatQuantity, reasonBadgeCls, reasonLabel } from "./utils/uiHelpers"

/**
 * Sugerencias de grupos probablemente duplicados.
 *
 * Es un atajo, no una restricción: seleccionar un grupo simplemente marca esos
 * artículos y abre el asistente, donde el supervisor puede ajustar todo antes
 * de confirmar. La heurística del backend es conservadora a propósito, así que
 * no encontrar un duplicado aquí no significa que no exista.
 */
export function DuplicateSuggestions({
    groups,
    onSelectGroup,
}: {
    groups: DuplicateCandidateGroup[]
    onSelectGroup: (articleIds: number[]) => void
}) {
    if (groups.length === 0) {
        return (
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">
                <div className="min-h-[140px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
                        <ShieldCheck className="size-4 opacity-60" />
                        <span className="text-[11px] tracking-widest uppercase">
                            Sin duplicados evidentes
                        </span>
                        <span className="text-xs text-muted-foreground/50 max-w-xs text-center mt-1">
                            Puede seleccionar artículos manualmente desde el inventario completo.
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {groups.map((group, index) => (
                <SuggestionCard
                    key={index}
                    group={group}
                    onSelect={() => onSelectGroup(group.articles.map((article) => article.id))}
                />
            ))}
        </div>
    )
}

function SuggestionCard({
    group,
    onSelect,
}: {
    group: DuplicateCandidateGroup
    onSelect: () => void
}) {
    const Icon = group.reason === "UNIT" ? Ruler : Tags

    return (
        <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 shadow-sm overflow-hidden">

            {/* ── Encabezado ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 select-none">
                <Icon className="size-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {group.label}
                </span>
                <div className="h-px flex-1 bg-border/50" />
                <Badge className={reasonBadgeCls(group.reason)}>
                    {reasonLabel(group.reason)}
                </Badge>
            </div>

            {/* ── Artículos del grupo ─────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 px-5">
                {group.articles.map((article) => (
                    <div
                        key={article.id}
                        className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/70 px-3 py-2"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{article.description}</div>
                            <div className="truncate text-[11px] text-muted-foreground/70">
                                {article.brand_model || "Sin marca"}
                                {article.variant_type ? ` · ${article.variant_type}` : ""}
                            </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 select-none">
                                Cantidad
                            </span>
                            <span className="text-sm font-medium tabular-nums">
                                {formatQuantity(article.quantity)}{" "}
                                <span className="text-muted-foreground/70 font-normal">
                                    {article.general_primary_unit?.label ?? ""}
                                </span>
                            </span>
                        </div>

                        <div className="hidden sm:flex flex-col items-end shrink-0 min-w-[72px]">
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 select-none">
                                Entradas
                            </span>
                            <span className="text-sm tabular-nums">{article.intakes_count}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Acción ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 mt-3 border-t border-border/50 bg-muted/20">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 select-none">
                    {group.articles.length} artículos
                </span>
                <SupervisorActionButton emphasis="primary" className="h-9" onClick={onSelect}>
                    Revisar y fusionar
                    <ArrowRight className="ml-2 size-4" />
                </SupervisorActionButton>
            </div>
        </div>
    )
}
