"use client";

import { Warehouse } from "lucide-react";
import type { Control } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { cn } from "@/lib/utils";

import {
    FormSection,
    fieldClass,
    labelClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

const FIELDS = [
    { name: "sender", label: "Remitente", placeholder: "Nombre del responsable" },
    { name: "origin", label: "Origen", placeholder: "Origen del artículo" },
    { name: "destination", label: "Destino", placeholder: "Destino del artículo" },
    {
        name: "justification",
        label: "Justificación",
        placeholder: "Motivo del ingreso",
    },
] as const;

/**
 * Procedencia del artículo: quién lo entrega, de dónde viene y a dónde va.
 *
 * Antes solo existía en los formularios de recepción; se muestra en los dos
 * destinos porque el dato es del artículo, no del acto de recepcionarlo.
 */
export const WarehouseDetailsSection = ({
    control,
    receptionDate,
    onReceptionDateChange,
    disabled,
}: {
    control: Control<any>;
    /** Sin estos dos, la sección omite la fecha. */
    receptionDate?: Date | null;
    onReceptionDateChange?: (date: Date | null | undefined) => void;
    disabled?: boolean;
}) => (
    <FormSection
        icon={Warehouse}
        title="Detalles de almacén"
        hint="Opcional. Procedencia y destino del artículo dentro de la empresa."
    >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FIELDS.map((entry) => (
                <FormField
                    key={entry.name}
                    control={control}
                    name={entry.name}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            {/* `h-4`: la fecha de recepción lleva la casilla "No
                                aplica" en su rótulo, más alta que el texto.
                                Igualando la altura todos los inputs de la fila
                                quedan en la misma línea. */}
                            <FormLabel className={cn(labelClass, "flex h-4 items-center")}>
                                {entry.label}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={entry.placeholder}
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={disabled}
                                    className={fieldClass}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}

            {/* Sin FormItem alrededor: añadía un segundo `space-y-2` sobre el
                que el propio campo ya trae, y separaba de más su input. */}
            {onReceptionDateChange && (
                <DatePickerField
                    label="Fecha de recepción"
                    value={receptionDate}
                    setValue={onReceptionDateChange}
                    description="Cuándo llegó el artículo al almacén."
                    busy={disabled}
                    shortcuts="back"
                    showNotApplicable
                    notApplicableInLabel
                />
            )}
        </div>
    </FormSection>
);
