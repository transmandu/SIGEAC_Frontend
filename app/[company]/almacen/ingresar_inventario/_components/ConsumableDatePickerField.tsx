"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Helper function to check if date is the "Not Applicable" date (1900-01-01)
export const isNotApplicableDate = (date: Date | null | undefined): boolean => {
  if (!date || !(date instanceof Date)) return false;
  return (
    date.getFullYear() === 1900 && date.getMonth() === 0 && date.getDate() === 1
  );
};

/**
 * DICCIONARIO DE TRADUCCIONES AUTOMÁTICAS
 */
const translations: Record<string, string> = {
  "Fecha de Fabricación": "Date of manufacture",
  "Fecha de Expiración": "Expiration date",
  "Fecha de Recibo": "Received date",
  "Fecha de la Parte": "Part date",
  "Fecha de Inspección": "Inspection date",
  "Fecha de Incoming": "Incoming date",
  "Próximo Vencimiento": "Next expiration date",
};

export function ConsumableDatePickerField({
  label,
  value,
  setValue,
  description,
  busy,
  maxYear,
  showNotApplicable = false,
  required = false,
  error,
}: {
  label: React.ReactNode;
  value?: Date | null;
  setValue: (d?: Date | null) => void;
  description?: string;
  busy?: boolean;
  maxYear?: number;
  shortcuts?: string;
  showNotApplicable?: boolean;
  required?: boolean;
  error?: string;
}) {
  const [touched, setTouched] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isInputMode, setIsInputMode] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const renderLabelContent = () => {
    if (typeof label === "string" && translations[label]) {
      return (
        <span className="flex items-center">
          {label}
          <span className="text-xs italic text-gray-500 font-normal ml-1">
            ({translations[label]})
          </span>
        </span>
      );
    }
    return label;
  };

  const isInvalid = required && value === undefined && touched;
  const displayError =
    error ||
    (isInvalid
      ? "Este campo es obligatorio. Debe seleccionar una fecha o marcar 'No aplica'."
      : undefined);

  useEffect(() => {
    if (value && value instanceof Date && !isNotApplicableDate(value)) {
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

    if (validationError) {
      setValidationError("");
    }

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
      formatted =
        digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    }

    setInputValue(formatted);

    if (formatted.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
      const parsedDate = parseDateFromInput(formatted);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        setValue(parsedDate);
        setValidationError("");
      } else {
        setValue(undefined);
      }
    } else {
      setValue(undefined);
    }
  };

  const handleInputBlur = useCallback(() => {
    setTouched(true);
    setValidationError("");

    if (!inputValue.trim()) {
      setValue(undefined);
      return;
    }

    let inputToValidate = inputValue;

    const parts = inputValue.split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2].padStart(4, "0");
      if (year.length === 4) {
        inputToValidate = `${day}/${month}/${year}`;
      }
    }

    if (
      inputToValidate.length !== 10 ||
      !/^\d{2}\/\d{2}\/\d{4}$/.test(inputToValidate)
    ) {
      const defaultDate = new Date(2001, 0, 1);
      setValue(defaultDate);
      setInputValue(format(defaultDate, "dd/MM/yyyy"));
      return;
    }

    const parsedDate = parseDateFromInput(inputToValidate);

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setValue(parsedDate);
      setInputValue(format(parsedDate, "dd/MM/yyyy"));
    } else {
      const defaultDate = new Date(2001, 0, 1);
      setValue(defaultDate);
      setInputValue(format(defaultDate, "dd/MM/yyyy"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, setValue]);

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setTouched(true);
    setValue(date);
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"));
    }
    setIsInputMode(false);
  };

  const handleNotApplicableChange = (checked: boolean) => {
    setTouched(true);
    if (checked === true) {
      setValue(new Date(1900, 0, 1));
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

  const labelId =
    typeof label === "string"
      ? label.replace(/\s+/g, "-").toLowerCase()
      : "date";

  return (
    <FormItem className="flex flex-col p-0 mt-2.5 w-full">
      <FormLabel className="flex items-center">
        {renderLabelContent()}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>

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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearInput}
                disabled={busy}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={busy || (showNotApplicable && value === null)}
                    onClick={() => setTouched(true)}
                    className={cn(
                      "flex-1 pl-3 text-left font-normal",
                      (!value || value === null) && "text-muted-foreground",
                      isInvalid && "border-destructive",
                    )}
                  >
                    {value && isNotApplicableDate(value) ? (
                      <span>N/A</span>
                    ) : value ? (
                      format(value, "PPP", { locale: es })
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-[100]"
                align="start"
                side="bottom"
                sideOffset={8}
                avoidCollisions={true}
              >
                <Calendar
                  locale={es}
                  mode="single"
                  selected={
                    value && !isNotApplicableDate(value) ? value : undefined
                  }
                  onSelect={handleCalendarSelect}
                  initialFocus
                  defaultMonth={
                    value && !isNotApplicableDate(value) ? value : new Date()
                  }
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={maxYear ?? new Date().getFullYear() + 20}
                  classNames={{
                    caption_label: "hidden",
                    caption:
                      "flex justify-center pt-1 relative items-center mb-2",
                    caption_dropdowns: "flex justify-center gap-2 items-center",
                    nav: "hidden",
                  }}
                  components={{
                    Dropdown: (props) => (
                      <select
                        {...props}
                        className="h-9 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors cursor-pointer"
                      >
                        {props.children}
                      </select>
                    ),
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {showNotApplicable && (
          <div className="flex items-center space-x-2 mt-1">
            <Checkbox
              id={`not-applicable-${labelId}`}
              checked={value !== undefined && isNotApplicableDate(value)}
              onCheckedChange={handleNotApplicableChange}
              disabled={busy}
            />
            <label
              htmlFor={`not-applicable-${labelId}`}
              className="text-sm font-medium leading-none cursor-pointer whitespace-nowrap select-none"
            >
              No aplica
            </label>
          </div>
        )}
      </div>

      {description && <FormDescription>{description}</FormDescription>}
      {validationError && (
        <p className="text-sm font-medium text-destructive mt-1">
          {validationError}
        </p>
      )}
      {displayError && !validationError && (
        <p className="text-sm font-medium text-destructive mt-1">
          {displayError}
        </p>
      )}
      <FormMessage />
    </FormItem>
  );
}
