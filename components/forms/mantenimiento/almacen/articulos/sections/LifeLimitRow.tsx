"use client";

import type { Control } from "react-hook-form";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { cn } from "@/lib/utils";

import {
    hintClass,
    labelClass,
    numericFieldClass,
    onlyNumeric,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

/**
 * Un límite de vida y sus tres medidas.
 *
 * Los seis campos de límites estaban sueltos en una rejilla y no se leía cuál
 * pertenecía a cuál: aquí cada límite es una fila con su nombre, y las tres
 * columnas siempre significan lo mismo — horas, ciclos y fecha tope.
 */
export const LifeLimitRow = ({
    control,
    title,
    hint,
    hoursName,
    cyclesName,
    calendarValue,
    onCalendarChange,
    disabled,
}: {
    control: Control<any>;
    title: string;
    hint?: string;
    hoursName: string;
    cyclesName: string;
    calendarValue?: Date | null;
    onCalendarChange: (date?: Date | null) => void;
    disabled?: boolean;
}) => (
    <div className="space-y-2">
        <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground/90">{title}</h4>
            {hint && <p className={hintClass}>{hint}</p>}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
                control={control}
                name={hoursName}
                render={({ field }) => (
                    <FormItem className="w-full">
                        {/* `h-4`: la fecha tope lleva la casilla "No aplica" en
                            su rótulo, más alta que el texto. Igualando la altura
                            los tres inputs quedan en la misma línea. */}
                        <FormLabel className={cn(labelClass, "flex h-4 items-center")}>
                            Horas
                        </FormLabel>
                        <FormControl>
                            <Input
                                inputMode="decimal"
                                placeholder="0"
                                {...field}
                                value={field.value ?? ""}
                                disabled={disabled}
                                className={numericFieldClass}
                                onChange={(e) => field.onChange(onlyNumeric(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name={cyclesName}
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel className={cn(labelClass, "flex h-4 items-center")}>
                            Ciclos
                        </FormLabel>
                        <FormControl>
                            <Input
                                inputMode="numeric"
                                placeholder="0"
                                {...field}
                                value={field.value ?? ""}
                                disabled={disabled}
                                className={numericFieldClass}
                                onChange={(e) => field.onChange(onlyNumeric(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <DatePickerField
                label="Fecha tope"
                value={calendarValue}
                setValue={onCalendarChange}
                busy={disabled}
                shortcuts="forward"
                showNotApplicable
                notApplicableInLabel
            />
        </div>
    </div>
);
