"use client"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Unit } from "@/types"
import type { ArticleConversion, ConversionEdits } from "@/types/supervisor"
import { Check, Info, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useState } from "react"
import { DecimalInput } from "./DecimalInput"
import { dependencyBadgeCls } from "./utils/uiHelpers"

/**
 * Conversiones de un artículo.
 *
 * Nada se escribe aquí: los cambios se acumulan en `edits` y se persisten al
 * confirmar el diálogo, junto con los datos y el historial de costo, en una
 * sola transacción. Así el supervisor puede revisar todo lo que va a cambiar
 * antes de aplicarlo, y cancelar lo descarta por completo.
 *
 * Una `conversion` es una fila del catálogo compartido: el mismo registro puede
 * estar asociado a varios artículos. Cuando shared_with > 0, editar la
 * equivalencia no altera la fila — el backend crea una copia exclusiva para
 * este artículo (copy-on-write). El panel lo advierte antes de confirmar.
 */
export function ConversionsPanel({
    conversions,
    units,
    edits,
    onChange,
}: {
    conversions: ArticleConversion[]
    units: Unit[]
    edits: ConversionEdits
    onChange: (edits: ConversionEdits) => void
}) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState("")
    const [adding, setAdding] = useState(false)

    const deleted = edits.deleted ?? []
    const updated = edits.updated ?? []
    const created = edits.created ?? []

    /** Equivalencia pendiente de una conversión, si el supervisor la cambió. */
    const pendingEquivalence = (id: number) =>
        updated.find((row) => row.id === id)?.equivalence

    const commitEdit = (conversionId: number) => {
        const equivalence = Number(editValue)

        if (!Number.isFinite(equivalence) || equivalence <= 0) return

        onChange({
            ...edits,
            updated: [
                ...updated.filter((row) => row.id !== conversionId),
                { id: conversionId, equivalence },
            ],
        })

        setEditingId(null)
    }

    const toggleDelete = (conversionId: number) =>
        onChange({
            ...edits,
            deleted: deleted.includes(conversionId)
                ? deleted.filter((id) => id !== conversionId)
                : [...deleted, conversionId],
        })

    return (
        <div className="flex flex-col gap-3">
            {conversions.length === 0 && created.length === 0 && !adding && (
                <div className="rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 py-10 text-center">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 select-none">
                        Sin conversiones registradas
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                {conversions.map((conversion) => {
                    const isEditing = editingId === conversion.id
                    const isDeleted = deleted.includes(conversion.id)
                    const pending = pendingEquivalence(conversion.id)

                    return (
                        <div
                            key={conversion.id}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                                isDeleted
                                    ? "border-border/40 bg-muted/20 opacity-50"
                                    : pending !== undefined
                                      ? "border-sky-400/50 bg-sky-500/[0.06] dark:border-sky-300/30"
                                      : "border-border/60 bg-background/70",
                            )}
                        >
                            <span className="text-sm text-muted-foreground shrink-0">
                                1 {conversion.primary_unit_label ?? "—"}
                            </span>
                            <span className="text-muted-foreground/50">=</span>

                            {isEditing ? (
                                <DecimalInput
                                    autoFocus
                                    className="h-8 w-28 bg-background border-border/60"
                                    value={editValue}
                                    onValueChange={setEditValue}
                                />
                            ) : (
                                <span
                                    className={cn(
                                        "text-sm font-medium tabular-nums",
                                        isDeleted && "line-through",
                                    )}
                                >
                                    {pending ?? conversion.equivalence}
                                    {pending !== undefined && (
                                        <span className="ml-1.5 text-[11px] font-normal text-muted-foreground/60 line-through">
                                            {conversion.equivalence}
                                        </span>
                                    )}
                                </span>
                            )}

                            <span className="text-sm text-muted-foreground truncate flex-1">
                                {conversion.secondary_unit_label ?? "—"}
                            </span>

                            {conversion.shared_with > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className={dependencyBadgeCls()}>
                                                <Info className="inline size-3 mr-1" />
                                                Compartida
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            La usan {conversion.shared_with} artículo(s) más. Al
                                            confirmar se creará una conversión propia para este
                                            artículo, sin alterar la de los demás.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            <div className="flex items-center gap-0.5 shrink-0">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => commitEdit(conversion.id)}
                                        >
                                            <Check className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditingId(null)}
                                        >
                                            <X className="size-3.5" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[11px] text-muted-foreground hover:text-foreground"
                                            disabled={isDeleted}
                                            onClick={() => {
                                                setEditingId(conversion.id)
                                                setEditValue(
                                                    String(pending ?? conversion.equivalence),
                                                )
                                            }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => toggleDelete(conversion.id)}
                                        >
                                            {isDeleted ? (
                                                <RotateCcw className="size-3.5" />
                                            ) : (
                                                <Trash2 className="size-3.5" />
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* Conversiones nuevas, aún sin persistir */}
                {created.map((row, index) => (
                    <div
                        key={`new-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-sky-400/40 bg-sky-500/[0.06] dark:border-sky-300/25 px-3 py-2.5"
                    >
                        <span className="text-sm text-muted-foreground shrink-0">
                            1 {units.find((unit) => unit.id === row.primary_unit)?.label ?? "—"}
                        </span>
                        <span className="text-muted-foreground/50">=</span>
                        <span className="text-sm font-medium tabular-nums">{row.equivalence}</span>
                        <span className="text-sm text-muted-foreground truncate flex-1">
                            {units.find((unit) => unit.id === row.secondary_unit)?.label ?? "—"}
                        </span>
                        <span className={dependencyBadgeCls()}>Nueva</span>
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

            {adding ? (
                <NewConversionRow
                    units={units}
                    onAdd={(row) => {
                        onChange({ ...edits, created: [...created, row] })
                        setAdding(false)
                    }}
                    onCancel={() => setAdding(false)}
                />
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setAdding(true)}
                >
                    <Plus className="mr-2 size-3.5" />
                    Agregar conversión
                </Button>
            )}
        </div>
    )
}

function NewConversionRow({
    units,
    onAdd,
    onCancel,
}: {
    units: Unit[]
    onAdd: (row: { primary_unit: number; secondary_unit: number; equivalence: number }) => void
    onCancel: () => void
}) {
    const [primaryUnit, setPrimaryUnit] = useState<number | null>(null)
    const [secondaryUnit, setSecondaryUnit] = useState<number | null>(null)
    const [equivalence, setEquivalence] = useState("")

    const equivalenceValue = Number(equivalence)

    const isValid =
        !!primaryUnit &&
        !!secondaryUnit &&
        primaryUnit !== secondaryUnit &&
        Number.isFinite(equivalenceValue) &&
        equivalenceValue > 0

    return (
        <div className="flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/[0.06] dark:border-sky-300/25 px-3 py-2.5">
            <span className="text-sm text-muted-foreground shrink-0">1</span>

            <Select
                value={String(primaryUnit ?? "")}
                onValueChange={(value) => setPrimaryUnit(Number(value))}
            >
                <SelectTrigger className="h-8 w-[130px] text-xs bg-background border-border/60">
                    <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent>
                    {units.map((unit) => (
                        <SelectItem key={unit.id} value={String(unit.id)} className="text-xs">
                            {unit.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="text-muted-foreground/50">=</span>

            <DecimalInput
                placeholder="0.00"
                className="h-8 w-24 bg-background border-border/60"
                value={equivalence}
                onValueChange={setEquivalence}
            />

            <Select
                value={String(secondaryUnit ?? "")}
                onValueChange={(value) => setSecondaryUnit(Number(value))}
            >
                <SelectTrigger className="h-8 w-[130px] text-xs bg-background border-border/60">
                    <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent>
                    {units.map((unit) => (
                        <SelectItem key={unit.id} value={String(unit.id)} className="text-xs">
                            {unit.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5 ml-auto shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    disabled={!isValid}
                    onClick={() =>
                        onAdd({
                            primary_unit: primaryUnit!,
                            secondary_unit: secondaryUnit!,
                            equivalence: equivalenceValue,
                        })
                    }
                >
                    <Check className="size-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={onCancel}
                >
                    <X className="size-3.5" />
                </Button>
            </div>
        </div>
    )
}
