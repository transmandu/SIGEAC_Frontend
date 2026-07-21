"use client"

import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { CostChangeEdits, SupervisorCostHistoryEntry } from "@/types/supervisor"
import { Lock, Plus, RotateCcw, Trash2 } from "lucide-react"
import { DecimalInput } from "./DecimalInput"
import { dependencyBadgeCls, formatSupervisorDateTime } from "./utils/uiHelpers"

/**
 * Historial de costo de un artículo, editable en sitio.
 *
 * Distingue dos orígenes con reglas distintas:
 *
 * - PURCHASE: entradas de compra (general_article_intakes) atadas a una orden
 *   pagada. Bloqueadas — editarlas rompería el rastro entre lo que se pagó y lo
 *   que entró al inventario.
 * - MANUAL / SEED: ajustes de precio. Editables, eliminables, y se pueden
 *   añadir nuevos.
 *
 * Nada se escribe aquí: los cambios se acumulan en `edits` y se persisten al
 * confirmar el diálogo, junto con los datos y las conversiones, en una sola
 * transacción. Cancelar los descarta por completo.
 */
export function CostHistoryPanel({
    history,
    currentCost,
    edits,
    onChange,
}: {
    history: SupervisorCostHistoryEntry[]
    currentCost: number
    edits: CostChangeEdits
    onChange: (edits: CostChangeEdits) => void
}) {
    const updated = edits.updated ?? []
    const deleted = edits.deleted ?? []
    const created = edits.created ?? []

    const changeIdOf = (entry: SupervisorCostHistoryEntry): number | null =>
        entry.entry_id.startsWith("change:")
            ? Number(entry.entry_id.slice("change:".length))
            : null

    const editableCount = history.filter((entry) => entry.editable).length

    /** Costo pendiente de un registro, si el supervisor lo cambió. */
    const pendingCost = (id: number) => updated.find((row) => row.id === id)?.cost

    const setCost = (id: number, value: string) => {
        const cost = Number(value)

        onChange({
            ...edits,
            updated:
                value === "" || !Number.isFinite(cost)
                    ? updated.filter((row) => row.id !== id)
                    : [...updated.filter((row) => row.id !== id), { id, cost }],
        })
    }

    const toggleDelete = (id: number) =>
        onChange({
            ...edits,
            deleted: deleted.includes(id)
                ? deleted.filter((item) => item !== id)
                : [...deleted, id],
        })

    return (
        <div className="flex flex-col gap-3">

            {/* Costo vigente */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 select-none">
                    Costo vigente
                </span>
                <span className="text-sm font-semibold tabular-nums">
                    {Number(currentCost).toFixed(2)}
                </span>
            </div>

            {history.length === 0 && created.length === 0 && (
                <div className="rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 py-10 text-center">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 select-none">
                        Sin historial de costo
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                {history.map((entry) => {
                    const changeId = changeIdOf(entry)
                    const isDeleted = changeId !== null && deleted.includes(changeId)
                    const isPurchase = !entry.editable

                    return (
                        <div
                            key={entry.entry_id}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                                isDeleted
                                    ? "border-border/40 bg-muted/20 opacity-50"
                                    : "border-border/60 bg-background/70",
                            )}
                        >
                            <span className={dependencyBadgeCls()}>{entry.source}</span>

                            {isPurchase ? (
                                <span className="text-sm font-medium tabular-nums w-32">
                                    {Number(entry.cost ?? 0).toFixed(2)}
                                </span>
                            ) : (
                                <DecimalInput
                                    className={cn(
                                        "h-8 w-32 bg-background border-border/60",
                                        changeId !== null &&
                                            pendingCost(changeId) !== undefined &&
                                            "border-sky-400/60 bg-sky-500/[0.06]",
                                    )}
                                    value={
                                        changeId !== null
                                            ? String(pendingCost(changeId) ?? entry.cost ?? "")
                                            : String(entry.cost ?? "")
                                    }
                                    onValueChange={(value) => {
                                        if (changeId === null) return
                                        setCost(changeId, value)
                                    }}
                                    disabled={isDeleted}
                                />
                            )}

                            <div className="min-w-0 flex-1 flex flex-col">
                                <span className="text-[11px] text-muted-foreground/70 truncate">
                                    {formatSupervisorDateTime(entry.date)}
                                    {entry.by ? ` · ${entry.by}` : ""}
                                </span>
                                {entry.purchase_order_number && (
                                    <span className="text-[11px] text-muted-foreground/50 truncate">
                                        OC {entry.purchase_order_number}
                                        {entry.requisition_order_number
                                            ? ` · REQ ${entry.requisition_order_number}`
                                            : ""}
                                    </span>
                                )}
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {/* span envolvente: un button deshabilitado
                                            no dispara los eventos del tooltip. */}
                                        <span className="inline-flex shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={isPurchase}
                                                className="size-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    if (changeId === null) return
                                                    toggleDelete(changeId)
                                                }}
                                            >
                                                {isPurchase ? (
                                                    <Lock className="size-3.5" />
                                                ) : isDeleted ? (
                                                    <RotateCcw className="size-3.5" />
                                                ) : (
                                                    <Trash2 className="size-3.5" />
                                                )}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        {isPurchase
                                            ? "Proviene de una compra registrada: no se puede editar ni eliminar"
                                            : isDeleted
                                              ? "Restaurar"
                                              : "Marcar para eliminar"}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )
                })}

                {created.map((row, index) => (
                    <div
                        key={`new-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-sky-400/40 bg-sky-500/[0.06] dark:border-sky-300/25 px-3 py-2"
                    >
                        <span className={dependencyBadgeCls()}>MANUAL</span>

                        <DecimalInput
                            placeholder="0.00"
                            className="h-8 w-32 bg-background border-border/60"
                            value={String(row.cost ?? "")}
                            onValueChange={(value) =>
                                onChange({
                                    ...edits,
                                    created: created.map((item, i) =>
                                        i === index ? { ...item, cost: Number(value) || 0 } : item,
                                    ),
                                })
                            }
                        />

                        <span className="text-[11px] text-muted-foreground/70 flex-1">
                            Se registrará con la fecha de hoy
                        </span>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                                onChange({
                                    ...edits,
                                    created: created.filter((_, i) => i !== index),
                                })
                            }
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="self-start h-8 text-muted-foreground hover:text-foreground"
                onClick={() => onChange({ ...edits, created: [...created, { cost: 0 }] })}
            >
                <Plus className="mr-2 size-3.5" />
                Añadir ajuste manual
            </Button>

            {editableCount === 0 && history.length > 0 && (
                <p className="text-[11px] text-muted-foreground/60">
                    Todo el historial proviene de compras registradas, así que no hay nada
                    editable. Puede añadir un ajuste manual si necesita corregir el costo vigente.
                </p>
            )}
        </div>
    )
}
