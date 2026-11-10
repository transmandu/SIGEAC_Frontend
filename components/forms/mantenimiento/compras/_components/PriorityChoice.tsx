"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selectTriggerClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";

/**
 * El punto de color es el mismo con el que se identifica la prioridad en las
 * tablas y detalles del módulo (rojo, naranja y verde).
 */
export const PRIORITY_OPTIONS = [
  {
    value: "HIGH",
    label: "Alta",
    description: "Se atiende primero",
    dot: "bg-red-500",
  },
  {
    value: "MEDIUM",
    label: "Media",
    description: "Plazo normal",
    dot: "bg-orange-500",
  },
  {
    value: "LOW",
    label: "Baja",
    description: "Puede esperar",
    dot: "bg-emerald-500",
  },
] as const;

export const priorityLabel = (value?: string) =>
  PRIORITY_OPTIONS.find((option) => option.value === value)?.label;

function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-2 shrink-0 rounded-full", className)}
    />
  );
}

/**
 * Lista de prioridades con el mismo campo que el resto de selectores. La
 * personalidad está en el punto de color —en el campo y en cada opción— y, en
 * el campo principal, en una línea bajo cada opción que dice qué significa. En
 * las filas repetidas (`sm`) la columna es angosta y solo se muestra el nombre.
 */
export function PriorityChoice({
  value,
  onChange,
  label,
  size = "md",
  placeholder = "Seleccione prioridad...",
  disabled,
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  /** Nombre accesible del campo. */
  label: string;
  /** `sm` para filas repetidas; `md` para el dato principal. */
  size?: "md" | "sm";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const selected = PRIORITY_OPTIONS.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          selectTriggerClass,
          "w-full max-sm:h-10 max-sm:text-base",
          size === "md" ? "h-10" : "h-9",
          className,
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selected && (
            <span className="inline-flex items-center gap-2">
              <Dot className={selected.dot} />
              {selected.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className={size === "md" ? "min-w-52" : "min-w-36"}>
        {PRIORITY_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="py-2 max-sm:py-3"
          >
            <span className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-2 font-medium">
                <Dot className={option.dot} />
                {option.label}
              </span>
              {size === "md" && (
                <span className="pl-4 text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
