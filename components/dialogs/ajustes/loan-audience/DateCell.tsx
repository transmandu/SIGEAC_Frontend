"use client";

import { DateField } from "@/components/misc/DateField";

/**
 * Fecha efectiva de una elección: desde cuándo vale (alta) o desde cuándo dejó
 * de valer (baja). Puede ser anterior a hoy en los dos sentidos: así se
 * incorpora a quien ya tiene registros antiguos y se registra una baja que
 * ocurrió hace un tiempo. Corta el clic para no alternar la fila.
 */
export function DateCell({
  caption,
  value,
  max,
  onChange,
}: {
  caption: string;
  value: string;
  max: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="space-y-1 max-sm:w-full"
    >
      <p className="text-xs leading-none text-muted-foreground">{caption}</p>
      <DateField
        value={value}
        max={max}
        clearable={false}
        onChange={(next) => next && onChange(next)}
        aria-label={caption}
        className="w-40 max-sm:w-full"
      />
    </div>
  );
}
