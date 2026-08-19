"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Plus, Ruler, Scale, X } from "lucide-react"

const fieldClass = cn(
    "h-9 rounded-lg text-sm tabular-nums",
    "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
    "border border-slate-400/60 dark:border-slate-600/60 shadow-sm",
    "hover:border-blue-400/30 transition-all duration-200",
)

export type UnitOption = { id: number; label: string; value: string }

/** En qué sentido escribió el usuario la equivalencia. */
export type ConversionDirection = "base_per_unit" | "units_per_base"

export type ExtraConversionDraft = {
    unit_id: number
    value: string
    direction: ConversionDirection
}

export type IntakeDimensionDraft = {
    axes: 1 | 2
    measure_unit_id: string
    piece_length: string
    piece_width: string
}

export const EMPTY_INTAKE_DIMENSION: IntakeDimensionDraft = {
    axes: 2,
    measure_unit_id: "",
    piece_length: "",
    piece_width: "",
}

function onlyNumeric(raw: string) {
    const cleaned = raw.replace(/[^\d.]/g, "")
    const parts = cleaned.split(".")
    return parts.length <= 1 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`
}

/** Equivalencias listas para el backend; descarta las incompletas. */
export function extraConversionsPayload(
    rows: ExtraConversionDraft[],
    active: IntakeExtra,
) {
    if (active !== "conversions") return []

    return rows
        .filter((r) => r.unit_id > 0 && parseFloat(r.value) > 0)
        .map((r) => ({
            unit_id: r.unit_id,
            // El backend normaliza según la dirección: da igual en qué sentido
            // le resulte natural decirlo al almacenista.
            direction: r.direction,
            value: parseFloat(r.value),
        }))
}

/**
 * Bloque dimensional listo para el backend, o null si está incompleto.
 *
 * `active` decide si viaja: al cambiar de bloque lo escrito se descarta, así
 * que nunca se guarda algo que el usuario ya no ve en pantalla.
 */
export function intakeDimensionPayload(
    draft: IntakeDimensionDraft,
    active: IntakeExtra,
) {
    if (active !== "dimension") return null

    const length = parseFloat(draft.piece_length)
    const width = parseFloat(draft.piece_width)
    const unitId = Number(draft.measure_unit_id)

    if (!unitId || !(length > 0)) return null
    if (draft.axes === 2 && !(width > 0)) return null

    return {
        axes: draft.axes,
        measure_unit_id: unitId,
        piece_length: length,
        piece_width: draft.axes === 2 ? width : undefined,
    }
}

/** Qué bloque está desplegado; null mientras no se pida ninguno. */
export type IntakeExtra = "conversions" | "dimension" | null

interface Props {
    /** Catálogo completo, para declarar equivalencias hacia cualquier unidad. */
    units: UnitOption[]
    /** Solo las marcadas como aptas para medidas. */
    measureUnits: UnitOption[]
    baseUnitLabel?: string | null
    /** Piezas que se crearían; null si la cantidad no es entera. */
    piecesToAdd: number | null
    /** El artículo ya está dimensionado: no se redefine desde aquí. */
    alreadyDimensional?: boolean
    active: IntakeExtra
    onActiveChange: (next: IntakeExtra) => void
    conversions: ExtraConversionDraft[]
    onConversionsChange: (rows: ExtraConversionDraft[]) => void
    dimension: IntakeDimensionDraft
    onDimensionChange: (next: IntakeDimensionDraft) => void
    disabled?: boolean
}

/**
 * Opciones que el almacenista puede declarar al confirmar una entrada.
 *
 * Los dos accesos están siempre, no solo cuando el sistema detecta un
 * conflicto: quien confirma tiene la mercancía delante y ya sabe si se va a
 * cortar en trazos o despachar en otra unidad.
 *
 * Solo se despliega uno a la vez. Un artículo podría tener pieza estandarizada
 * y además despacharse a ojo, pero permitir ambos abre casos que el motor aún
 * no resuelve, así que de momento se restringe a uno.
 */
export function IntakeExtrasPanel({
    units,
    measureUnits,
    baseUnitLabel,
    piecesToAdd,
    alreadyDimensional,
    active,
    onActiveChange,
    conversions,
    onConversionsChange,
    dimension,
    onDimensionChange,
    disabled,
}: Props) {
    const availableUnits = units.filter(
        (u) => !conversions.some((c) => c.unit_id === u.id),
    )

    const selectedMeasure = measureUnits.find(
        (u) => String(u.id) === dimension.measure_unit_id,
    )
    const measureLabel = selectedMeasure?.label ?? ""

    const length = parseFloat(dimension.piece_length)
    const width = parseFloat(dimension.piece_width)
    const magnitude =
        dimension.axes === 2
            ? length > 0 && width > 0
                ? length * width
                : null
            : length > 0
              ? length
              : null

    const canDimension =
        !alreadyDimensional && piecesToAdd !== null && measureUnits.length > 0

    return (
        <div className="space-y-2">
            {/* Accesos discretos: el diálogo de confirmación es corto y estos
                bloques son la excepción, no el caso normal. */}
            <div className="flex justify-end gap-1.5">
                <Button
                    type="button"
                    variant={active === "conversions" ? "secondary" : "ghost"}
                    size="sm"
                    disabled={disabled}
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={() =>
                        onActiveChange(active === "conversions" ? null : "conversions")
                    }
                >
                    <Plus
                        className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            active === "conversions" && "rotate-45",
                        )}
                    />
                    <Scale className="h-3.5 w-3.5" />
                    Equivalencia
                </Button>
                <Button
                    type="button"
                    variant={active === "dimension" ? "secondary" : "ghost"}
                    size="sm"
                    disabled={disabled}
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={() =>
                        onActiveChange(active === "dimension" ? null : "dimension")
                    }
                >
                    <Plus
                        className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            active === "dimension" && "rotate-45",
                        )}
                    />
                    <Ruler className="h-3.5 w-3.5" />
                    Medidas
                </Button>
            </div>

            {active !== null && (
        <div className="space-y-3 rounded-lg border border-slate-400/50 bg-muted/20 p-3 dark:border-slate-600/50">
            {/* ── Equivalencias de unidad ── */}
            {active === "conversions" && (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-[13px] font-medium">
                        Equivalencias de unidad
                    </Label>
                    <span className="text-xs text-muted-foreground">
                        cuántas unidades base hay en otra presentación
                    </span>
                </div>

                {conversions.map((row, index) => {
                    const unitLabel = units.find((u) => u.id === row.unit_id)?.label
                        ?? `#${row.unit_id}`
                    const base = baseUnitLabel ?? "unidad base"

                    // El sentido invierte los rótulos: el número siempre queda
                    // entre "1 <izquierda> =" y "<derecha>".
                    const left = row.direction === "base_per_unit" ? unitLabel : base
                    const right = row.direction === "base_per_unit" ? base : unitLabel

                    const update = (patch: Partial<ExtraConversionDraft>) => {
                        const next = [...conversions]
                        next[index] = { ...row, ...patch }
                        onConversionsChange(next)
                    }

                    return (
                        <div key={row.unit_id} className="space-y-1.5 rounded-md border border-slate-400/40 p-2 dark:border-slate-600/40">
                            {/* Cómo se lee la equivalencia: el almacenista la
                                declara en el sentido que tenga a mano. */}
                            <Select
                                value={row.direction}
                                disabled={disabled}
                                onValueChange={(v) =>
                                    update({ direction: v as ConversionDirection })
                                }
                            >
                                {/* El texto va en el trigger y no vía SelectValue:
                                    Radix no puede extraerlo del SelectItem
                                    cuando lleva interpolaciones, y el control
                                    aparecía vacío. */}
                                <SelectTrigger className={cn(fieldClass, "h-8 text-xs")}>
                                    <span className="truncate">
                                        1 {left} = ? {right}
                                    </span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="base_per_unit" className="text-xs">
                                        {`1 ${unitLabel} = ? ${base}`}
                                    </SelectItem>
                                    <SelectItem value="units_per_base" className="text-xs">
                                        {`1 ${base} = ? ${unitLabel}`}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                    1 {left} =
                                </span>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    disabled={disabled}
                                    value={row.value}
                                    onChange={(e) => update({ value: onlyNumeric(e.target.value) })}
                                    placeholder="0"
                                    className={cn(fieldClass, "h-8 w-24")}
                                />
                                <span className="flex-1 truncate text-xs font-medium">
                                    {right}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    disabled={disabled}
                                    onClick={() =>
                                        onConversionsChange(conversions.filter((_, i) => i !== index))
                                    }
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )
                })}

                {availableUnits.length > 0 && (
                    <Select
                        disabled={disabled}
                        value=""
                        onValueChange={(v) =>
                            onConversionsChange([
                                ...conversions,
                                { unit_id: Number(v), value: "", direction: "base_per_unit" },
                            ])
                        }
                    >
                        <SelectTrigger className={cn(fieldClass, "justify-start gap-1.5")}>
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Agregar equivalencia
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            {availableUnits.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>
                                    {u.label} ({u.value})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            )}

            {/* ── Medición por dimensiones ── */}
            {active === "dimension" && (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-[13px] font-medium">
                        Medición por dimensiones
                    </Label>
                    <span className="text-xs text-muted-foreground">
                        se despacha en trazos
                    </span>
                </div>

                {alreadyDimensional ? (
                    <p className="text-xs text-muted-foreground">
                        El artículo ya se mide por dimensiones. Las piezas entrarán
                        con las medidas declaradas y no se editan aquí.
                    </p>
                ) : piecesToAdd === null ? (
                    <p className="text-xs text-muted-foreground">
                        La cantidad recibida no representa piezas enteras, así que
                        no puede dimensionarse.
                    </p>
                ) : measureUnits.length === 0 ? (
                    <p className="text-xs text-amber-600">
                        Ninguna unidad está habilitada para medidas. Márquelas en
                        Ajustes › Unidades.
                    </p>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground">
                            Se crearán{" "}
                            <span className="font-medium text-foreground">
                                {piecesToAdd} pieza(s)
                            </span>{" "}
                            y la salida descontará el área cortada de una pieza
                            concreta.
                        </p>

                        {(
                            <div className="space-y-2">
                                <Tabs
                                    value={String(dimension.axes)}
                                    onValueChange={(v) =>
                                        onDimensionChange({
                                            ...dimension,
                                            axes: Number(v) as 1 | 2,
                                        })
                                    }
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="2" className="text-xs">
                                            Por área
                                        </TabsTrigger>
                                        <TabsTrigger value="1" className="text-xs">
                                            A lo largo
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <Select
                                    disabled={disabled}
                                    value={dimension.measure_unit_id}
                                    onValueChange={(v) =>
                                        onDimensionChange({ ...dimension, measure_unit_id: v })
                                    }
                                >
                                    <SelectTrigger className={fieldClass}>
                                        <SelectValue placeholder="Unidad de medida" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {measureUnits.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.label} ({u.value})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div
                                    className={cn(
                                        "grid gap-2",
                                        dimension.axes === 2 ? "grid-cols-2" : "grid-cols-1",
                                    )}
                                >
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        disabled={disabled}
                                        value={dimension.piece_length}
                                        onChange={(e) =>
                                            onDimensionChange({
                                                ...dimension,
                                                piece_length: onlyNumeric(e.target.value),
                                            })
                                        }
                                        placeholder={
                                            dimension.axes === 2 ? "Largo" : "Longitud"
                                        }
                                        className={fieldClass}
                                    />
                                    {dimension.axes === 2 && (
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            disabled={disabled}
                                            value={dimension.piece_width}
                                            onChange={(e) =>
                                                onDimensionChange({
                                                    ...dimension,
                                                    piece_width: onlyNumeric(e.target.value),
                                                })
                                            }
                                            placeholder="Ancho"
                                            className={fieldClass}
                                        />
                                    )}
                                </div>

                                {magnitude !== null && (
                                    <p className="text-xs font-medium tabular-nums">
                                        Cada pieza rinde {Number(magnitude.toFixed(6))}{" "}
                                        {measureLabel}
                                        {dimension.axes === 2 ? "²" : ""}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            )}
        </div>
            )}
        </div>
    )
}
