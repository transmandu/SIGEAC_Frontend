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
import type { Unit } from "@/types";
import type { ConversionDirection } from "@/types/supervisor";
import { Plus, X } from "lucide-react";
import { useState } from "react";

/**
 * Conversión declarada para un consumible, en el formato que espera el backend.
 * `direction` indica en qué sentido la escribió el usuario; el backend la
 * normaliza a "cuántas unidades base hay en 1 unidad alterna".
 */
export type ConsumableConversionInput = {
    unit_id: number;
    direction: ConversionDirection;
    value: number;
};

/**
 * Captura las equivalencias de un consumible hacia otras unidades.
 *
 * Cada equivalencia pertenece a este artículo y sólo a él: una CAJA de un
 * consumible no contiene lo mismo que la de otro, por eso no se eligen de un
 * catálogo compartido sino que se declaran aquí.
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

    const add = () => {
        if (!canAdd) return;

        onChange([
            ...value,
            { unit_id: Number(unitId), direction, value: numericAmount },
        ]);
        setUnitId("");
        setAmount("");
        setDirection("base_per_unit");
    };

    const remove = (removedUnitId: number) =>
        onChange(value.filter((row) => row.unit_id !== removedUnitId));

    if (!baseUnitId) {
        return (
            <p className="text-sm text-muted-foreground italic">
                Seleccione primero la unidad base del artículo.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
                <Select
                    value={unitId === "" ? "" : String(unitId)}
                    onValueChange={(next) => setUnitId(Number(next))}
                    disabled={disabled || availableUnits.length === 0}
                >
                    <SelectTrigger className="h-9 w-[170px]">
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
                    <SelectTrigger className="h-9 w-[200px]">
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

                <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    className="h-9 w-32"
                    placeholder="Ej: 100"
                    value={amount}
                    disabled={disabled || !unitId}
                    onChange={(event) => setAmount(event.target.value)}
                />

                <Button type="button" onClick={add} disabled={!canAdd} className="h-9">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                </Button>
            </div>

            {!!unitId && numericAmount > 0 && (
                <p className="text-sm text-muted-foreground">
                    Se guardará como:{" "}
                    <span className="font-medium text-foreground">
                        1 {leftLabel} = {numericAmount} {rightLabel}
                    </span>
                </p>
            )}

            <div className="space-y-2">
                {value.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        Sin conversiones declaradas. El artículo se manejará sólo en{" "}
                        {baseLabel}.
                    </p>
                ) : (
                    value.map((row) => {
                        const label =
                            units.find((unit) => unit.id === row.unit_id)?.label ?? "—";
                        const rowLeft =
                            row.direction === "base_per_unit" ? label : baseLabel;
                        const rowRight =
                            row.direction === "base_per_unit" ? baseLabel : label;

                        return (
                            <div
                                key={row.unit_id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <span className="text-sm font-medium tabular-nums">
                                    1 {rowLeft} = {row.value} {rowRight}
                                </span>
                                {!disabled && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(row.unit_id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
