"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ConversionDirection } from "@/types/supervisor";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

/**
 * Lo que el usuario declara al cambiar la unidad base de un artículo ya
 * existente. Se guarda tal como lo escribió, en la dirección que eligió, y es
 * el backend quien lo normaliza (misma convención que las conversiones, con la
 * unidad NUEVA como base y la anterior como alterna):
 *   base_per_unit  → "1 <anterior> = value <nueva>"
 *   units_per_base → "1 <nueva> = value <anterior>"
 */
export type BaseUnitChangeValue = {
    direction: ConversionDirection;
    amount: string;
    relabel: boolean;
};

export const EMPTY_BASE_UNIT_CHANGE: BaseUnitChangeValue = {
    direction: "base_per_unit",
    amount: "",
    relabel: false,
};

/** Un cambio de unidad no se puede guardar sin equivalencia ni corrección. */
export const isBaseUnitChangeReady = (value: BaseUnitChangeValue) =>
    value.relabel || Number(value.amount) > 0;

/** Equivalencia en el formato que espera el backend. */
export const baseUnitChangeEquivalence = (value: BaseUnitChangeValue) => ({
    direction: value.direction,
    value: Number(value.amount),
});

/** Campos que el backend espera junto al cambio de `primary_unit_id`. */
export const baseUnitChangePayload = (value: BaseUnitChangeValue) =>
    value.relabel
        ? { relabel_unit: true }
        : { unit_change: baseUnitChangeEquivalence(value) };

/**
 * Aviso que aparece apenas se elige otra unidad base: las salidas y demás
 * movimientos ya registrados están contados en la unidad anterior, así que el
 * sistema necesita saber cuánto vale una en términos de la otra para
 * convertirlos. No se adivina ni se asume 1:1.
 */
export function BaseUnitChangeNotice({
    oldLabel,
    newLabel,
    value,
    onChange,
    disabled,
    className,
    registeredOldPerNew,
}: {
    oldLabel: string;
    newLabel: string;
    value: BaseUnitChangeValue;
    onChange: (value: BaseUnitChangeValue) => void;
    disabled?: boolean;
    className?: string;
    /**
     * Unidades anteriores por 1 nueva cuando el artículo ya tenía la unidad
     * nueva como alterna registrada. Se ofrece en vez de pedir de nuevo un dato
     * que el sistema ya conoce (y que el backend exige que coincida).
     */
    registeredOldPerNew?: number;
}) {
    const amount = Number(value.amount);
    const hasFactor = !value.relabel && Number.isFinite(amount) && amount > 0;
    // Unidades nuevas por 1 anterior, sin importar en qué dirección se escribió.
    const factor = value.direction === "base_per_unit" ? amount : 1 / amount;

    const leftLabel = value.direction === "base_per_unit" ? oldLabel : newLabel;
    const rightLabel = value.direction === "base_per_unit" ? newLabel : oldLabel;

    return (
        <div
            className={cn(
                "space-y-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm",
                className,
            )}
        >
            <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p>
                    La unidad base pasa de <strong>{oldLabel}</strong> a{" "}
                    <strong>{newLabel}</strong>. Las salidas y demás movimientos ya
                    registrados están en {oldLabel}: indique la equivalencia para
                    convertirlos.
                </p>
            </div>

            {registeredOldPerNew !== undefined && !value.relabel && (
                <button
                    type="button"
                    disabled={disabled}
                    className="text-left text-xs underline underline-offset-2 disabled:opacity-50"
                    onClick={() =>
                        onChange({
                            ...value,
                            direction: "units_per_base",
                            amount: String(registeredOldPerNew),
                        })
                    }
                >
                    Este artículo ya tiene registrado 1 {newLabel} ={" "}
                    {registeredOldPerNew} {oldLabel}: usar esa equivalencia
                </button>
            )}

            <Select
                value={value.direction}
                onValueChange={(next) =>
                    onChange({ ...value, direction: next as ConversionDirection })
                }
                disabled={disabled || value.relabel}
            >
                <SelectTrigger className="h-9 w-full sm:w-72">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="base_per_unit">
                        1 {oldLabel} = ? {newLabel}
                    </SelectItem>
                    <SelectItem value="units_per_base">
                        1 {newLabel} = ? {oldLabel}
                    </SelectItem>
                </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2">
                <span className="whitespace-nowrap">1 {leftLabel} =</span>
                <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    className="h-9 w-32"
                    placeholder="Ej: 25"
                    value={value.amount}
                    disabled={disabled || value.relabel}
                    onChange={(event) =>
                        onChange({ ...value, amount: event.target.value })
                    }
                />
                <span className="whitespace-nowrap">{rightLabel}</span>
            </div>

            {hasFactor && (
                <p className="text-xs text-muted-foreground">
                    Una salida de 100 {oldLabel} quedará como{" "}
                    <span className="font-medium text-foreground tabular-nums">
                        {Number((100 * factor).toFixed(6))} {newLabel}
                    </span>
                    . La existencia no se convierte sola: ajústela si hace falta.
                </p>
            )}

            <label className="flex cursor-pointer items-start gap-2 text-xs">
                <Checkbox
                    checked={value.relabel}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                        onChange({ ...value, relabel: checked === true })
                    }
                />
                <span>
                    Solo corrijo una unidad mal puesta: las cantidades ya registradas
                    estaban bien y no se convierten.
                </span>
            </label>
        </div>
    );
}
