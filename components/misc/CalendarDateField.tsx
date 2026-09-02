"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { triggerButtonClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { formatCalendarDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface CalendarDateFieldProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Selector de FECHA DE CALENDARIO (columna `date`): el valor es un día suelto,
 * sin hora ni zona. Quien lo envíe debe usar `toCalendarPayload`, no
 * `toISOString()`, que corre el día hacia atrás al oeste de Greenwich.
 */
export function CalendarDateField({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
}: CalendarDateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(triggerButtonClass, !value && "text-muted-foreground", className)}
        >
          {value ? formatCalendarDate(value, "long") : placeholder}
          <CalendarIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          captionLayout="dropdown-buttons"
          fromYear={1990}
          toYear={new Date().getFullYear() + 5}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
