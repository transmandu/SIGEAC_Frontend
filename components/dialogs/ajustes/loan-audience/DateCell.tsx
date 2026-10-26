"use client";

import { Input } from "@/components/ui/input";

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
    <div onClick={(e) => e.stopPropagation()} className="space-y-1">
      <p className="text-[11px] leading-none text-muted-foreground">
        {caption}
      </p>
      <Input
        type="date"
        value={value}
        max={max}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        aria-label={caption}
        className="h-8 w-36 text-xs"
      />
    </div>
  );
}
