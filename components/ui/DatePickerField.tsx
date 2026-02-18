"use client";

import { useState, useEffect } from "react";
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

// Diccionario de traducciones automáticas para las etiquetas
const LABEL_TRANSLATIONS: Record<string, string> = {
  "Fecha de Fabricación": "Date of manufacture",
  "Fecha de Expiración": "Expiration date",
  "Fecha de Recibo": "Received date",
  "Fecha de la Parte": "Part date",
  "Fecha de Inspección": "Inspection date",
  "Fecha de Incoming": "Incoming Date",
  "Próximo Vencimiento": "Next Expiration",
  "Límite de Vida (Calendario)": "Life Limit (Calendar)",
  "Hard Time (Calendario)": "Hard Time (Calendar)",
};

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
}: DatePickerFieldProps) {
  const [touched, setTouched] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isInputMode, setIsInputMode] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Lógica para renderizar el label con traducción automática
  const renderLabel = () => {
    const translation = LABEL_TRANSLATIONS[label];
    return (
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2">
        {label}
        {translation && (
          <span className="text-xs italic text-gray-500 font-normal ml-1">
            ({translation})
          </span>
        )}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    );
  };

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

  return (
    <div className="flex flex-col p-0 mt-2.5 w-full">
      {renderLabel()}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={isInputMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsInputMode(true)}
            disabled={busy || (showNotApplicable && value === null)}
            className="flex-1"
          >
            Ingresar fecha
          </Button>
          <Button
            type="button"
            variant={!isInputMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsInputMode(false)}
            disabled={busy || (showNotApplicable && value === null)}
            className="flex-1"
          >
            Seleccionar fecha
          </Button>
        </div>

        {isInputMode ? (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="dd/mm/aaaa"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleInputKeyPress}
              disabled={busy || (showNotApplicable && value === null)}
              className={cn("flex-1", isInvalid && "border-destructive")}
              maxLength={10}
            />
            {inputValue && (
              <Button type="button" variant="outline" size="sm" onClick={clearInput} disabled={busy}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={busy || (showNotApplicable && value === null)}
                  onClick={() => setTouched(true)}
                  className={cn(
                    "flex-1 pl-3 text-left font-normal",
                    (!value || value === null) && "text-muted-foreground",
                    isInvalid && "border-destructive"
                  )}
                >
                  {value === null ? (
                    <span>N/A</span>
                  ) : value ? (
                    format(value, "PPP", { locale: es })
                  ) : (
                    <span>Seleccione una fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom">
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
        )}

        {showNotApplicable && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`not-applicable-${label.replace(/\s+/g, "-").toLowerCase()}`}
              checked={value === null}
              onCheckedChange={handleNotApplicableChange}
              disabled={busy}
            />
            <label
              htmlFor={`not-applicable-${label.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-sm font-medium cursor-pointer select-none"
            >
              No aplica
            </label>
          </div>
        )}
      </div>

      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      {displayError && <p className="text-sm font-medium text-destructive mt-1">{displayError}</p>}
    </div>
  );
}