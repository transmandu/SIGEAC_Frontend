"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  fieldClass,
  labelClass,
  triggerButtonClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Fecha y hora de un instante, editadas como hora de pared. El valor es un Date
 * cuyos campos locales son los de la zona de la compañía (ver
 * `toZonedWallClock` y `zonedWallClockToUtcIso` en lib/date): este componente
 * solo edita campos, no convierte zonas.
 */
export function DateTimeField({
  label,
  value,
  onChange,
  invalid,
  clearable,
  emptyLabel = "Sin fecha",
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  invalid?: boolean;
  /** Ofrece "Quitar" cuando hay valor (campos opcionales). */
  clearable?: boolean;
  emptyLabel?: string;
}) {
  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    const next = new Date(day);
    // Al elegir día se conserva la hora ya cargada; si no había fecha, arranca
    // en 00:00 para no inventar una hora que el usuario no eligió.
    next.setHours(value?.getHours() ?? 0, value?.getMinutes() ?? 0, 0, 0);
    onChange(next);
  };

  const handleTimeChange = (raw: string) => {
    // Sin fecha no hay a qué ponerle hora: tomar "hoy" aquí usaría el día del
    // navegador, que no tiene por qué ser el de la zona de la compañía. El
    // campo de hora queda deshabilitado hasta que se elige el día.
    if (!value) return;

    // Vaciar la hora a mano no es un valor: se ignora y el campo conserva la anterior.
    const [hours, minutes] = raw.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const next = new Date(value);
    next.setHours(hours, minutes, 0, 0);
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <Label className={labelClass}>{label}</Label>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-invalid={invalid || undefined}
              className={cn(
                triggerButtonClass,
                "h-10 min-w-44 flex-1 justify-start gap-2 text-sm max-sm:text-base",
                !value && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4 shrink-0 opacity-60" />
              {value
                ? format(value, "dd MMM yyyy", { locale: es })
                : emptyLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              locale={es}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <Input
          type="time"
          disabled={!value}
          aria-label={`Hora de ${label.toLowerCase()}`}
          aria-invalid={invalid || undefined}
          value={value ? format(value, "HH:mm") : ""}
          onChange={(e) => handleTimeChange(e.target.value)}
          className={cn(fieldClass, "h-10 w-32 max-sm:flex-1 max-sm:text-base")}
        />

        {clearable && value && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(null)}
            className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Quitar
          </Button>
        )}
      </div>
    </div>
  );
}
