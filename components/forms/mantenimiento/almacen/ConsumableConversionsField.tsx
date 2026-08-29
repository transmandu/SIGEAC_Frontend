"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    hintClass,
    numericFieldClass,
    selectTriggerClass,
} from "./_components/form-theme";
import type { Unit } from "@/types";
import type { ConversionDirection } from "@/types/supervisor";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

/**
 * Conversión declarada para un artículo, en el formato que espera el backend.
 * `direction` indica en qué sentido la escribió el usuario; el backend la
 * normaliza a "cuántas unidades base hay en 1 unidad alterna".
 */
export type ConsumableConversionInput = {
    unit_id: number;
    direction: ConversionDirection;
    value: number;
};

/**
 * Equivalencias del artículo hacia otras unidades.
 *
 * Cada equivalencia pertenece a este artículo y sólo a él: una CAJA de un
 * artículo no contiene lo mismo que la de otro, por eso no se eligen de un
 * catálogo compartido sino que se declaran aquí.
 *
 * En reposo sólo muestra la lista y el botón de agregar: el formulario que la
 * contiene ya es largo, así que la captura aparece únicamente al pedirla y la
 * lista scrollea en vez de empujar el resto de los campos.
 */
export function ConsumableConversionsField({
    units,
    baseUnitId,
    value,
    onChange,
    disabled,
}: {
    units: Unit[];
    baseUnitId?: number | null;
    value: ConsumableConversionInput[];
    onChange: (rows: ConsumableConversionInput[]) => void;
    disabled?: boolean;
}) {
    const [adding, setAdding] = useState(false);
    const [unitId, setUnitId] = useState<number | "">("");
    const [direction, setDirection] = useState<ConversionDirection>("base_per_unit");
    const [amount, setAmount] = useState("");

    const baseUnit = units.find((unit) => unit.id === baseUnitId);
    const baseLabel = baseUnit?.label ?? "unidad base";

    // La unidad base no necesita conversión, y una unidad ya declarada se edita
    // quitándola y volviéndola a agregar: no se ofrecen duplicados.
    const availableUnits = units.filter(
        (unit) =>
            unit.id !== baseUnitId && !value.some((row) => row.unit_id === unit.id),
    );

    const numericAmount = Number(amount);
    const canAdd =
        !!unitId && Number.isFinite(numericAmount) && numericAmount > 0 && !disabled;

    const selectedLabel = units.find((unit) => unit.id === unitId)?.label ?? "unidad";
    const leftLabel = direction === "base_per_unit" ? selectedLabel : baseLabel;
    const rightLabel = direction === "base_per_unit" ? baseLabel : selectedLabel;

    const resetDraft = () => {
        setUnitId("");
        setAmount("");
        setDirection("base_per_unit");
    };

    const add = () => {
        if (!canAdd) return;

        onChange([
            ...value,
            { unit_id: Number(unitId), direction, value: numericAmount },
        ]);
        resetDraft();
        setAdding(false);
    };

    const remove = (removedUnitId: number) =>
        onChange(value.filter((row) => row.unit_id !== removedUnitId));

    if (!baseUnitId) {
        return (
            <p className={cn(hintClass, "italic")}>
                Seleccione primero la unidad base del artículo.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className={hintClass}>
                    {value.length === 0
                        ? `Sólo se maneja en ${baseLabel}.`
                        : `${value.length} conversión(es) declarada(s).`}
                </span>

                {!adding && availableUnits.length > 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-8 shrink-0"
                                    onClick={() => setAdding(true)}
                                    disabled={disabled}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Agregar una conversión</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* Tope de ~3 filas: más allá scrollea en vez de estirar el formulario. */}
            {value.length > 0 && (
                <div className="max-h-[8.5rem] space-y-1.5 overflow-y-auto pr-1">
                    {value.map((row) => {
                        const label =
                            units.find((unit) => unit.id === row.unit_id)?.label ?? "—";
                        const rowLeft =
                            row.direction === "base_per_unit" ? label : baseLabel;
                        const rowRight =
                            row.direction === "base_per_unit" ? baseLabel : label;

                        return (
                            <div
                                key={row.unit_id}
                                className="flex items-center justify-between gap-2 rounded-md border bg-background/70 px-3 py-1.5"
                            >
                                <span className="truncate text-[15px] tabular-nums">
                                    1 {rowLeft} ={" "}
                                    <span className="font-medium">{row.value}</span>{" "}
                                    {rowRight}
                                </span>
                                {!disabled && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => remove(row.unit_id)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {adding && (
                <div className="space-y-2 rounded-md border bg-muted/30 p-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Select
                            value={unitId === "" ? "" : String(unitId)}
                            onValueChange={(next) => setUnitId(Number(next))}
                            disabled={disabled}
                        >
                            <SelectTrigger className={cn(selectTriggerClass, "h-10 text-sm")}>
                                <SelectValue placeholder="Unidad a convertir" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUnits.map((unit) => (
                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                        {unit.label} ({unit.value})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={direction}
                            onValueChange={(next) => setDirection(next as ConversionDirection)}
                            disabled={disabled || !unitId}
                        >
                            <SelectTrigger className={cn(selectTriggerClass, "h-10 text-sm")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="base_per_unit">
                                    1 {selectedLabel} = ? {baseLabel}
                                </SelectItem>
                                <SelectItem value="units_per_base">
                                    1 {baseLabel} = ? {selectedLabel}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {!!unitId && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="whitespace-nowrap text-[13px] text-muted-foreground">
                                1 {leftLabel} =
                            </span>
                            <Input
                                autoFocus
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="any"
                                className={cn(numericFieldClass, "h-10 w-28")}
                                placeholder="Ej: 100"
                                value={amount}
                                disabled={disabled}
                                onChange={(event) => setAmount(event.target.value)}
                            />
                            <span className="whitespace-nowrap text-[13px] text-muted-foreground">
                                {rightLabel}
                            </span>

                            <div className="ml-auto flex items-center gap-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={add}
                                    disabled={!canAdd}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => {
                                        resetDraft();
                                        setAdding(false);
                                    }}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {canAdd && (
                        <p className="text-xs text-muted-foreground">
                            Al despachar 1 {selectedLabel} se descontarán{" "}
                            <span className="font-medium text-foreground tabular-nums">
                                {Number(
                                    (direction === "base_per_unit"
                                        ? numericAmount
                                        : 1 / numericAmount
                                    ).toFixed(6),
                                )}{" "}
                                {baseLabel}
                            </span>
                            .
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
