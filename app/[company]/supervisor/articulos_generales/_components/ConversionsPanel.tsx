"use client"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Unit } from "@/types"
import type {
    ArticleConversion,
    ConversionDirection,
    ConversionEdits,
} from "@/types/supervisor"
import { Check, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useState } from "react"
import { DecimalInput } from "./DecimalInput"
import { dependencyBadgeCls } from "./utils/uiHelpers"

/**
 * Conversiones de un artículo.
 *
 * Nada se escribe aquí: los cambios se acumulan en `edits` y se persisten al
 * confirmar el diálogo, junto con los datos y el historial de costo, en una
 * sola transacción.
 *
 * Cada conversión pertenece a ESTE artículo: editarla no afecta a ningún otro.
 * El usuario declara la equivalencia en la dirección que le resulte natural
 * ("1 CAJA = 100 UNIDAD" o "1 LITRO = 1000 mL") y el backend la normaliza; por
 * eso cada fila viaja con su `direction`.
 */
export function ConversionsPanel({
    conversions,
    units,
    baseUnitLabel,
    edits,
    onChange,
}: {
    conversions: ArticleConversion[]
    units: Unit[]
    baseUnitLabel: string
    edits: ConversionEdits
    onChange: (edits: ConversionEdits) => void
}) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState("")
    const [adding, setAdding] = useState(false)

    const deleted = edits.deleted ?? []
    const updated = edits.updated ?? []
    const created = edits.created ?? []

    /** Valor pendiente de una conversión, si el supervisor lo cambió. */
    const pendingValue = (id: number) => updated.find((row) => row.id === id)?.value

    const commitEdit = (conversionId: number) => {
        const value = Number(editValue)

        if (!Number.isFinite(value) || value <= 0) return

        onChange({
            ...edits,
            updated: [
                ...updated.filter((row) => row.id !== conversionId),
                { id: conversionId, direction: "base_per_unit", value },
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
                    const pending = pendingValue(conversion.id)

                    return (
                        <div
                            key={conversion.id}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                                isDeleted
                                    ? "border-border/40 bg-muted/20 opacity-50"
                                    : pending !== undefined
                                      ? "border-primary/50 bg-primary/[0.06]"
                                      : "border-border/60 bg-background/70",
                            )}
                        >
                            <span className="text-sm text-muted-foreground shrink-0">
                                1 {conversion.unit_label ?? "—"}
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
                                    {pending ?? conversion.base_per_unit}
                                    {pending !== undefined && (
                                        <span className="ml-1.5 text-[11px] font-normal text-muted-foreground/60 line-through">
                                            {conversion.base_per_unit}
                                        </span>
                                    )}
                                </span>
                            )}

                            <span className="text-sm text-muted-foreground truncate flex-1">
                                {baseUnitLabel}
                            </span>

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
                                        {!isDeleted && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-[11px] text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    setEditingId(conversion.id)
                                                    setEditValue(
                                                        String(pending ?? conversion.base_per_unit),
                                                    )
                                                }}
                                            >
                                                Editar
                                            </Button>
                                        )}
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
                        className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/[0.06] px-3 py-2.5"
                    >
                        <span className="text-sm text-muted-foreground shrink-0">
                            1{" "}
                            {row.direction === "base_per_unit"
                                ? (units.find((unit) => unit.id === row.unit_id)?.label ?? "—")
                                : baseUnitLabel}
                        </span>
                        <span className="text-muted-foreground/50">=</span>
                        <span className="text-sm font-medium tabular-nums">{row.value}</span>
                        <span className="text-sm text-muted-foreground truncate flex-1">
                            {row.direction === "base_per_unit"
                                ? baseUnitLabel
                                : (units.find((unit) => unit.id === row.unit_id)?.label ?? "—")}
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
                    baseUnitLabel={baseUnitLabel}
                    existingUnitIds={[
                        ...conversions.map((row) => row.unit_id),
                        ...created.map((row) => row.unit_id),
                    ]}
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

/**
 * Captura una conversión nueva. El selector de dirección deja que el usuario
 * escriba la frase que conoce ("1 CAJA = 100 UNIDAD" o "1 LITRO = 1000 mL")
 * sin tener que calcular ningún inverso.
 */
function NewConversionRow({
    units,
    baseUnitLabel,
    existingUnitIds,
    onAdd,
    onCancel,
}: {
    units: Unit[]
    baseUnitLabel: string
    existingUnitIds: number[]
    onAdd: (row: {
        unit_id: number
        direction: ConversionDirection
        value: number
    }) => void
    onCancel: () => void
}) {
    const [unitId, setUnitId] = useState<number | null>(null)
    const [direction, setDirection] = useState<ConversionDirection>("base_per_unit")
    const [value, setValue] = useState("")

    const numericValue = Number(value)
    const alreadyExists = unitId !== null && existingUnitIds.includes(unitId)

    const isValid =
        !!unitId && !alreadyExists && Number.isFinite(numericValue) && numericValue > 0

    const unitLabel = units.find((unit) => unit.id === unitId)?.label ?? "unidad"
    const leftLabel = direction === "base_per_unit" ? unitLabel : baseUnitLabel
    const rightLabel = direction === "base_per_unit" ? baseUnitLabel : unitLabel

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary/[0.06] px-3 py-2.5">
            <div className="flex items-center gap-2">
                <Select
                    value={String(unitId ?? "")}
                    onValueChange={(next) => setUnitId(Number(next))}
                >
                    <SelectTrigger className="h-8 w-[160px] text-xs bg-background border-border/60">
                        <SelectValue placeholder="Unidad a convertir" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map((unit) => (
                            <SelectItem key={unit.id} value={String(unit.id)} className="text-xs">
                                {unit.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={direction}
                    onValueChange={(next) => setDirection(next as ConversionDirection)}
                >
                    <SelectTrigger className="h-8 w-[190px] text-xs bg-background border-border/60">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="base_per_unit" className="text-xs">
                            1 {unitLabel} = ? {baseUnitLabel}
                        </SelectItem>
                        <SelectItem value="units_per_base" className="text-xs">
                            1 {baseUnitLabel} = ? {unitLabel}
                        </SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-0.5 ml-auto shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        disabled={!isValid}
                        onClick={() =>
                            onAdd({ unit_id: unitId!, direction, value: numericValue })
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

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">1 {leftLabel}</span>
                <span className="text-muted-foreground/50">=</span>
                <DecimalInput
                    placeholder="0.00"
                    className="h-8 w-28 bg-background border-border/60"
                    value={value}
                    onValueChange={setValue}
                />
                <span className="text-sm text-muted-foreground truncate">{rightLabel}</span>
            </div>

            {alreadyExists && (
                <span className="text-xs text-destructive">
                    Este artículo ya tiene una conversión para esa unidad. Edite la existente
                    en vez de crear otra.
                </span>
            )}
        </div>
    )
}
