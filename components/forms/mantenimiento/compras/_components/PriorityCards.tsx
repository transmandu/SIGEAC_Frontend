"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { PRIORITY_OPTIONS } from "./PriorityChoice";

/**
 * Clases completas y estáticas por prioridad: Tailwind no ve las que se arman
 * por partes. `selected` es la elegida; `current` solo marca la vigente.
 */
const SELECTED_TONES: Record<string, string> = {
  HIGH: "border-red-500/60 bg-red-500/10 ring-1 ring-red-500/30",
  MEDIUM: "border-orange-500/60 bg-orange-500/10 ring-1 ring-orange-500/30",
  LOW: "border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30",
};

interface Props {
  value?: string;
  /** Prioridad vigente de la solicitud: se rotula "Actual". */
  current?: string;
  onChange: (value: string) => void;
  label: string;
}

/**
 * Las tres prioridades a la vista, para el dato que más pesa de una solicitud.
 * Donde la prioridad es un campo más de una fila, se usa `PriorityChoice`.
 */
export function PriorityCards({ value, current, onChange, label }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      {PRIORITY_OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex touch-manipulation flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? SELECTED_TONES[option.value]
                : "border-slate-300/70 bg-background/60 hover:border-blue-400/40 dark:border-slate-600/60",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span
                aria-hidden
                className={cn("size-2.5 shrink-0 rounded-full", option.dot)}
              />
              {option.label}
              {selected && (
                <Check aria-hidden className="ml-auto size-4 text-foreground" />
              )}
            </span>

            <span className="pl-4.5 text-xs text-muted-foreground">
              {option.value === current ? "Actual" : option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
