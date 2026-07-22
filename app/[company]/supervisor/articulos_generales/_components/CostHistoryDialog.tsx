"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CostChangeEdits, SupervisorCostHistoryEntry } from "@/types/supervisor"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Lock, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { DecimalInput } from "./DecimalInput"
import SupervisorActionButton from "./SupervisorActionButton"
import { dependencyBadgeCls, formatSupervisorDateTime } from "./utils/uiHelpers"

/**
 * Editor del historial de costo combinado del grupo en fusión.
 *
 * Distingue dos orígenes con reglas distintas:
 *
 * - PURCHASE: son entradas de compra (general_article_intakes) atadas a una
 *   orden pagada. Se muestran bloqueadas — editarlas o borrarlas rompería el
 *   rastro entre lo que se pagó y lo que entró al inventario.
 * - MANUAL / SEED: ajustes y siembras de precio. El supervisor puede editarlos,
 *   eliminarlos y añadir nuevos.
 *
 * Nada se escribe aquí: los cambios se acumulan y se aplican en la misma
 * transacción que la fusión, de modo que cancelar el merge los descarta.
 */
export function CostHistoryDialog({
    open,
    onOpenChange,
    history,
    edits,
    units,
    onApply,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    history: SupervisorCostHistoryEntry[]
    edits: CostChangeEdits
    // Unidades del grupo en fusión, para anclar/corregir la unidad de un costo.
    units: { id: number; label: string }[]
    onApply: (edits: CostChangeEdits) => void
}) {
    // Estado local: solo se propaga al confirmar, para que cerrar con Cancelar
    // descarte lo tecleado sin ensuciar el asistente. Cada ajuste editable lleva
    // su unit_id (unidad en que está el costo) y su changed_at (fecha del costo,
    // editable a mano; null = conservar la que ya tenía / hoy si es nuevo).
    const [updated, setUpdated] = useState<
        Record<number, { cost: string; unit_id: number | null; changed_at: string | null }>
    >({})
    const [deleted, setDeleted] = useState<number[]>([])
    const [created, setCreated] = useState<
        { cost: string; unit_id: number | null; changed_at: string | null }[]
    >([])

    // Unidad por defecto de un ajuste nuevo: la primera del grupo (normalmente la
    // base propuesta). El supervisor la ajusta si el costo es de otra unidad.
    const defaultUnitId = units[0]?.id ?? null

    useEffect(() => {
        if (!open) return

        setUpdated(
            Object.fromEntries(
                (edits.updated ?? []).map((row) => [
                    row.id,
                    {
                        cost: String(row.cost),
                        unit_id: row.unit_id ?? null,
                        changed_at: row.changed_at ?? null,
                    },
                ]),
            ),
        )
        setDeleted(edits.deleted ?? [])
        setCreated(
            (edits.created ?? []).map((row) => ({
                cost: String(row.cost),
                unit_id: row.unit_id ?? defaultUnitId,
                changed_at: row.changed_at ?? null,
            })),
        )
    }, [open, edits, defaultUnitId])

    const changeIdOf = (entry: SupervisorCostHistoryEntry): number | null =>
        entry.entry_id.startsWith("change:")
            ? Number(entry.entry_id.slice("change:".length))
            : null

    /** Solo los ya persistidos: los "new:" viven en el estado `created`. */
    const persisted = useMemo(
        () => history.filter((entry) => !entry.entry_id.startsWith("new:")),
        [history],
    )

    const editableCount = persisted.filter((entry) => entry.editable).length

    const handleConfirm = () => {
        onApply({
            created: created
                .map((row) => ({
                    cost: Number(row.cost),
                    unit_id: row.unit_id,
                    changed_at: row.changed_at ?? undefined,
                }))
                .filter((row) => Number.isFinite(row.cost) && row.cost >= 0),
            updated: Object.entries(updated)
                .map(([id, value]) => ({
                    id: Number(id),
                    cost: Number(value.cost),
                    unit_id: value.unit_id,
                    // null = no tocar la fecha (conserva su changed_at original).
                    changed_at: value.changed_at ?? undefined,
                }))
                .filter((row) => Number.isFinite(row.cost) && row.cost >= 0),
            deleted,
        })

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b border-border/60 pb-4">
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                        Historial de costo
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Los registros de compra no se editan: provienen de una orden pagada. Los
                        ajustes manuales sí puede modificarlos, eliminarlos o añadir nuevos. Todo
                        se aplica al confirmar la fusión.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-1">

                    {/* ── Registros existentes ────────────────────────────── */}
                    <div className="flex flex-col gap-1.5">
                        {persisted.length === 0 && (
                            <div className="rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 py-10 text-center">
                                <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 select-none">
                                    Sin historial de costo
                                </span>
                            </div>
                        )}

                        {persisted.map((entry) => {
                            const changeId = changeIdOf(entry)
                            const isDeleted = changeId !== null && deleted.includes(changeId)

                            return (
                                <CostEntryRow
                                    key={entry.entry_id}
                                    entry={entry}
                                    isDeleted={isDeleted}
                                    units={units}
                                    value={
                                        changeId !== null
                                            ? updated[changeId]?.cost ?? String(entry.cost ?? "")
                                            : String(entry.cost ?? "")
                                    }
                                    unitId={
                                        changeId !== null
                                            ? updated[changeId]?.unit_id ?? entry.unit_id ?? null
                                            : entry.unit_id ?? null
                                    }
                                    changedAt={
                                        changeId !== null ? updated[changeId]?.changed_at ?? null : null
                                    }
                                    onValueChange={(value) => {
                                        if (changeId === null) return
                                        setUpdated((current) => ({
                                            ...current,
                                            [changeId]: {
                                                cost: value,
                                                unit_id: current[changeId]?.unit_id ?? entry.unit_id ?? null,
                                                changed_at: current[changeId]?.changed_at ?? null,
                                            },
                                        }))
                                    }}
                                    onUnitChange={(unitId) => {
                                        if (changeId === null) return
                                        setUpdated((current) => ({
                                            ...current,
                                            [changeId]: {
                                                cost: current[changeId]?.cost ?? String(entry.cost ?? ""),
                                                unit_id: unitId,
                                                changed_at: current[changeId]?.changed_at ?? null,
                                            },
                                        }))
                                    }}
                                    onDateChange={(iso) => {
                                        if (changeId === null) return
                                        setUpdated((current) => ({
                                            ...current,
                                            [changeId]: {
                                                cost: current[changeId]?.cost ?? String(entry.cost ?? ""),
                                                unit_id: current[changeId]?.unit_id ?? entry.unit_id ?? null,
                                                changed_at: iso,
                                            },
                                        }))
                                    }}
                                    onToggleDelete={() => {
                                        if (changeId === null) return
                                        setDeleted((current) =>
                                            current.includes(changeId)
                                                ? current.filter((id) => id !== changeId)
                                                : [...current, changeId],
                                        )
                                    }}
                                />
                            )
                        })}
                    </div>

                    {/* ── Nuevos ajustes ──────────────────────────────────── */}
                    {created.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none">
                                Nuevos ajustes
                            </span>

                            {created.map((row, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-lg border border-sky-400/40 bg-sky-500/[0.06] dark:border-sky-300/25 px-3 py-2"
                                >
                                    <span className={dependencyBadgeCls()}>MANUAL</span>

                                    <DecimalInput
                                        placeholder="0.00"
                                        className="h-8 w-24 bg-background border-border/60"
                                        value={row.cost}
                                        onValueChange={(value) =>
                                            setCreated((current) =>
                                                current.map((item, i) =>
                                                    i === index ? { ...item, cost: value } : item,
                                                ),
                                            )
                                        }
                                    />

                                    {units.length > 0 && (
                                        <Select
                                            value={row.unit_id != null ? String(row.unit_id) : ""}
                                            onValueChange={(value) =>
                                                setCreated((current) =>
                                                    current.map((item, i) =>
                                                        i === index ? { ...item, unit_id: Number(value) } : item,
                                                    ),
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-28 bg-background border-border/60 text-xs">
                                                <SelectValue placeholder="Unidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    <div className="flex-1 flex items-center gap-1.5">
                                        <span className="text-[11px] text-muted-foreground/70">por unidad ·</span>
                                        <CostDateButton
                                            iso={row.changed_at}
                                            onChange={(iso) =>
                                                setCreated((current) =>
                                                    current.map((item, i) =>
                                                        i === index ? { ...item, changed_at: iso } : item,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                                                    onClick={() =>
                                                        setCreated((current) =>
                                                            current.filter((_, i) => i !== index),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Descartar</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="self-start h-8 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                            setCreated((current) => [
                                ...current,
                                { cost: "", unit_id: defaultUnitId, changed_at: null },
                            ])
                        }
                    >
                        <Plus className="mr-2 size-3.5" />
                        Añadir ajuste manual
                    </Button>

                    {editableCount === 0 && created.length === 0 && persisted.length > 0 && (
                        <p className="text-[11px] text-muted-foreground/60">
                            Todo el historial proviene de compras registradas, así que no hay nada
                            editable. Puede añadir un ajuste manual si necesita corregir el costo
                            vigente.
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 border-t border-border/60 pt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <SupervisorActionButton emphasis="primary" onClick={handleConfirm}>
                        Aplicar cambios
                    </SupervisorActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CostEntryRow({
    entry,
    isDeleted,
    units,
    value,
    unitId,
    changedAt,
    onValueChange,
    onUnitChange,
    onDateChange,
    onToggleDelete,
}: {
    entry: SupervisorCostHistoryEntry
    isDeleted: boolean
    units: { id: number; label: string }[]
    value: string
    unitId: number | null
    // Fecha pendiente editada por el usuario (ISO), o null si conserva la suya.
    changedAt: string | null
    onValueChange: (value: string) => void
    onUnitChange: (unitId: number) => void
    onDateChange: (iso: string | null) => void
    onToggleDelete: () => void
}) {
    const isPurchase = !entry.editable

    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                isDeleted
                    ? "border-border/40 bg-muted/20 opacity-50"
                    : "border-border/60 bg-background/70",
            )}
        >
            <span className={dependencyBadgeCls()}>{entry.source}</span>

            {isPurchase ? (
                <>
                    <span
                        className={cn(
                            "text-sm font-medium tabular-nums w-24",
                            isDeleted && "line-through",
                        )}
                    >
                        {Number(entry.cost ?? 0).toFixed(2)}
                    </span>
                    {/* La unidad de una compra es inmutable: viene del intake. */}
                    <span className="text-xs text-muted-foreground/70 w-28 truncate">
                        {entry.unit_label ?? "—"}
                    </span>
                </>
            ) : (
                <>
                    <DecimalInput
                        className="h-8 w-24 bg-background border-border/60"
                        value={value}
                        onValueChange={onValueChange}
                        disabled={isDeleted}
                    />
                    {units.length > 0 && (
                        <Select
                            value={unitId != null ? String(unitId) : ""}
                            onValueChange={(next) => onUnitChange(Number(next))}
                            disabled={isDeleted}
                        >
                            <SelectTrigger className="h-8 w-28 bg-background border-border/60 text-xs">
                                <SelectValue placeholder="Unidad" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                        {unit.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </>
            )}

            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                {isPurchase ? (
                    <span className="text-[11px] text-muted-foreground/70 truncate">
                        {formatSupervisorDateTime(entry.date)}
                        {entry.by ? ` · ${entry.by}` : ""}
                    </span>
                ) : (
                    // La fecha de un ajuste manual es editable: es su fecha de
                    // creación (por ella se ordena el historial), y a veces hay
                    // que corregirla si una edición previa la movió.
                    <CostDateButton
                        // El valor mostrado prioriza lo que el usuario editó;
                        // si no tocó nada, la fecha original del registro.
                        iso={changedAt ?? entry.date}
                        disabled={isDeleted}
                        onChange={onDateChange}
                    />
                )}
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
                        {/* span envolvente: un button deshabilitado no dispara
                            los eventos que el tooltip necesita. */}
                        <span className="inline-flex shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isPurchase}
                                onClick={onToggleDelete}
                                className={cn(
                                    "size-8 text-muted-foreground",
                                    !isPurchase && "hover:text-foreground",
                                )}
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
                    <TooltipContent>
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
}

/**
 * Editor compacto de la fecha de un ajuste de costo. Muestra la fecha vigente y,
 * al abrir el calendario, permite reasignarla — útil cuando una edición previa
 * movió la fecha de creación y hay que devolverla a su valor correcto.
 *
 * Emite la fecha como ISO (yyyy-MM-dd) para el backend; null cuando no hay valor.
 */
function CostDateButton({
    iso,
    disabled,
    onChange,
}: {
    iso: string | null
    disabled?: boolean
    onChange: (iso: string | null) => void
}) {
    const parsed = iso ? new Date(iso) : undefined
    const valid = parsed && !isNaN(parsed.getTime()) ? parsed : undefined

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="h-6 -ml-1 px-1.5 gap-1.5 text-[11px] font-normal text-muted-foreground/80 hover:text-foreground justify-start"
                >
                    <CalendarIcon className="size-3" />
                    {valid ? format(valid, "dd/MM/yyyy", { locale: es }) : "Sin fecha"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                    locale={es}
                    mode="single"
                    selected={valid}
                    onSelect={(date) => {
                        if (!date) return
                        // Se envía solo la fecha (sin hora): es la fecha de
                        // creación del costo, la hora no aporta al ordenamiento.
                        onChange(format(date, "yyyy-MM-dd"))
                    }}
                    initialFocus
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 1}
                    captionLayout="dropdown-buttons"
                    disabled={(date) => date > new Date()}
                />
            </PopoverContent>
        </Popover>
    )
}
