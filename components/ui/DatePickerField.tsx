"use client";

import { useEffect, useId, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  fieldClass,
  hintClass,
  labelClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

interface DatePickerFieldProps {
  label: string;
  value?: Date | null;
  setValue: (d?: Date | null) => void;
  description?: string;
  busy?: boolean;
  shortcuts?: "both" | "back" | "forward" | "none";
  maxYear?: number;
  showNotApplicable?: boolean;
  required?: boolean;
  error?: string;
  /**
   * Sube "No aplica" a la línea del rótulo.
   *
   * Debajo del campo, la casilla añade una línea que los campos vecinos no
   * tienen y desalinea el input cuando comparten fila.
   */
  notApplicableInLabel?: boolean;
}

export function DatePickerField({
  label,
  value,
  setValue,
  description,
  busy,
  shortcuts = "both",
  maxYear,
  showNotApplicable = false,
  required = false,
  error,
  notApplicableInLabel = false,
}: DatePickerFieldProps) {
  const [touched, setTouched] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isInputMode, setIsInputMode] = useState(false);
  const [validationError, setValidationError] = useState("");
  // El id no puede salir del rótulo: hay formularios con dos fechas homónimas
  // (el "Fecha tope" de Life Limit y el de Hard Time) y ambas casillas
  // quedarían enlazadas al mismo control.
  const checkboxId = `${useId()}-not-applicable`;

  /**
   * Rótulo del campo, opcionalmente con la casilla "No aplica" a su derecha.
   *
   * La fila mide lo mismo que la casilla, que es el elemento más alto, y el
   * hueco hasta el input lo pone el `space-y-2` del contenedor: así el input
   * arranca a la misma altura que los campos con los que comparte fila.
   */
  const renderLabel = (checkbox?: React.ReactNode) => (
    <div className="flex h-4 items-center justify-between gap-3">
      <label className={cn(labelClass, "leading-none")}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {checkbox}
    </div>
  );

  const isInvalid = required && value === undefined && touched;
  const displayError =
    error ||
    (isInvalid
      ? "Este campo es obligatorio. Debe seleccionar una fecha o marcar 'No aplica'."
      : undefined);

  useEffect(() => {
    if (value && value instanceof Date) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  const isValidDate = (day: number, month: number, year: number): boolean => {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString.trim()) return null;
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return null;
    const parts = dateString.split("/");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (!isValidDate(day, month, year)) return null;
    return new Date(year, month - 1, day);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (validationError) setValidationError("");
    if (newValue === "") {
      setInputValue("");
      setValue(undefined);
      return;
    }
    const digits = newValue.replace(/\D/g, "").slice(0, 8);
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    }
    setInputValue(formatted);

    if (formatted.length === 10) {
      const parsedDate = parseDateFromInput(formatted);
      if (parsedDate) {
        setValue(parsedDate);
        setValidationError("");
      } else {
        setValue(undefined);
      }
    } else {
      setValue(undefined);
    }
  };

  const handleInputBlur = () => {
    setTouched(true);
    setValidationError("");
    if (!inputValue.trim()) {
      setValue(undefined);
      return;
    }

    const parsedDate = parseDateFromInput(inputValue);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setValue(parsedDate);
      setInputValue(format(parsedDate, "dd/MM/yyyy"));
    } else {
      const defaultDate = new Date(2001, 0, 1);
      setValue(defaultDate);
      setInputValue(format(defaultDate, "dd/MM/yyyy"));
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleInputBlur();
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setTouched(true);
    setValue(date);
    if (date) setInputValue(format(date, "dd/MM/yyyy"));
    setIsInputMode(false);
  };

  const handleNotApplicableChange = (checked: boolean) => {
    setTouched(true);
    if (checked === true) {
      setValue(null);
      setInputValue("");
    } else {
      setValue(undefined);
      setInputValue("");
    }
  };

  const clearInput = () => {
    setInputValue("");
    setValue(undefined);
    setValidationError("");
    setTouched(true);
  };

  const notApplicable = showNotApplicable && value === null;
  const disabled = busy || notApplicable;

  const notApplicableCheckbox = showNotApplicable ? (
    <label
      htmlFor={checkboxId}
      className="flex shrink-0 cursor-pointer select-none items-center gap-1.5 text-[13px] text-muted-foreground"
    >
      <Checkbox
        id={checkboxId}
        checked={value === null}
        onCheckedChange={handleNotApplicableChange}
        disabled={busy}
        className="h-4 w-4"
      />
      No aplica
    </label>
  ) : null;

  return (
    <div className="w-full space-y-2">
      {renderLabel(notApplicableInLabel ? notApplicableCheckbox : undefined)}

      {/* Un solo control: se escribe la fecha y el icono abre el calendario.
          Antes había dos botones de modo que ocupaban una fila entera por
          cada fecha, y los formularios tienen hasta cinco. */}
      <div className="relative">
        <Input
          type="text"
          placeholder={notApplicable ? "No aplica" : "dd/mm/aaaa"}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyPress}
          disabled={disabled}
          maxLength={10}
          className={cn(
            fieldClass,
            "pr-16",
            isInvalid && "border-destructive",
            notApplicable && "text-muted-foreground",
          )}
        />

        <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={clearInput}
              aria-label="Limpiar fecha"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTouched(true)}
                aria-label="Abrir calendario"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="z-[100] w-auto rounded-xl border-slate-400/60 p-0 shadow-lg dark:border-slate-600/60"
              align="end"
              side="bottom"
              sideOffset={8}
              // Los selectores de mes y año se montan en su propio portal:
              // elegir uno cuenta como clic fuera y cerraría el calendario.
              onInteractOutside={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest("[data-radix-select-viewport]")) {
                  event.preventDefault();
                }
              }}
            >
              <Calendar
                locale={es}
                mode="single"
                selected={value || undefined}
                onSelect={handleCalendarSelect}
                initialFocus
                fromYear={1900}
                toYear={maxYear ?? new Date().getFullYear() + 20}
                captionLayout="dropdown-buttons"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {(description || !notApplicableInLabel) && (
        <div className="flex items-start justify-between gap-3">
          {description ? (
            <p className={cn(hintClass, "min-w-0 flex-1")}>{description}</p>
          ) : (
            <span className="flex-1" />
          )}

          {!notApplicableInLabel && notApplicableCheckbox}
        </div>
      )}

      {displayError && (
        <p className="text-sm font-medium text-destructive">{displayError}</p>
      )}
    </div>
  );
}