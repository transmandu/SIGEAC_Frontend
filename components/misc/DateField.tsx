"use client";

import { forwardRef, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import { fieldClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseCalendarDate, toCalendarPayload } from "@/lib/date";
import { cn } from "@/lib/utils";

const MIN_YEAR = 1900;

/** `2026-11-10` → `10/11/2026`; vacío si no es una fecha de calendario. */
const toDisplay = (iso: string) => {
  const date = parseCalendarDate(iso);
  return date ? format(date, "dd/MM/yyyy") : "";
};

/** Lo escrito (solo dígitos, con las barras puestas) tal como se va tecleando. */
const mask = (digits: string) => {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/** `dd/mm/aaaa` completo y real (no 31/02) → ISO; si no, `null`. */
const fromDisplay = (text: string): string | null => {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, d, m, y] = match.map(Number);
  if (y < MIN_YEAR) return null;

  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return toCalendarPayload(date) ?? null;
};

interface DateFieldProps {
  /** Fecha de calendario `yyyy-MM-dd`, o vacío. */
  value: string;
  onChange: (value: string) => void;
  /** Primer y último día permitidos, `yyyy-MM-dd`. */
  min?: string;
  max?: string;
  disabled?: boolean;
  /** Ofrece "Borrar" en el calendario; apagarlo si el campo no admite vacío. */
  clearable?: boolean;
  className?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

/**
 * Campo de fecha del sistema: se puede teclear (`dd/mm/aaaa`, con las barras
 * puestas solas) o elegir en el calendario. Es una fecha de calendario sin hora
 * ni zona: entrega y recibe `yyyy-MM-dd`, sin pasar por `toISOString()`.
 *
 * Lo tecleado solo se acepta si es una fecha real dentro de `min`/`max`; si no,
 * al salir del campo vuelve al último valor bueno.
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      disabled,
      clearable = true,
      className,
      onBlur,
      ...inputProps
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    // Lo que se está tecleando; `null` = mostrar el valor guardado.
    const [draft, setDraft] = useState<string | null>(null);

    const selected = parseCalendarDate(value);
    const minDate = parseCalendarDate(min);
    const maxDate = parseCalendarDate(max);
    const today = new Date();

    const outOfRange = (iso: string) =>
      (!!min && iso < min) || (!!max && iso > max);

    const text = draft ?? toDisplay(value);
    const typedInvalid = draft !== null && draft.length === 10;

    const handleType = (raw: string) => {
      const previous = draft ?? toDisplay(value);
      let digits = raw.replace(/\D/g, "");

      // Borrar una barra no cambia los dígitos: sin esto el campo no retrocede.
      if (
        raw.length < previous.length &&
        digits === previous.replace(/\D/g, "")
      ) {
        digits = digits.slice(0, -1);
      }

      if (digits === "") {
        setDraft(null);
        if (value) onChange("");
        return;
      }

      const next = mask(digits);
      const iso = fromDisplay(next);

      if (iso && !outOfRange(iso)) {
        setDraft(null);
        onChange(iso);
        return;
      }

      setDraft(next);
    };

    const pick = (iso: string) => {
      setDraft(null);
      onChange(iso);
      setOpen(false);
    };

    const todayIso = toCalendarPayload(today) ?? "";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className={cn("relative", className)}>
            <Input
              {...inputProps}
              ref={ref}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              disabled={disabled}
              value={text}
              aria-invalid={typedInvalid ? true : inputProps["aria-invalid"]}
              onChange={(event) => handleType(event.target.value)}
              onBlur={() => {
                setDraft(null);
                onBlur?.();
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && !open) {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
              className={cn(fieldClass, "pr-11 tabular-nums")}
            />

            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                aria-label="Abrir el calendario"
                className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
              >
                <CalendarDays className="size-4" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          className="w-auto overflow-hidden rounded-xl p-0 shadow-lg"
          // El foco lo toma el día seleccionado (autoFocus del calendario), no
          // la primera flecha de la cabecera.
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            locale={es}
            selected={selected}
            defaultMonth={selected ?? maxDate ?? today}
            onSelect={(date) => date && pick(toCalendarPayload(date) ?? "")}
            captionLayout="dropdown"
            startMonth={minDate ?? new Date(MIN_YEAR, 0)}
            endMonth={maxDate ?? new Date(today.getFullYear() + 5, 11)}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            autoFocus
          />

          <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2">
            {clearable ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!value}
                onClick={() => {
                  setDraft(null);
                  onChange("");
                  setOpen(false);
                }}
                className="h-8 px-2 text-muted-foreground"
              >
                Borrar
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={outOfRange(todayIso)}
              onClick={() => pick(todayIso)}
              className="h-8 px-2 font-medium text-primary hover:text-primary"
            >
              Hoy
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

DateField.displayName = "DateField";
