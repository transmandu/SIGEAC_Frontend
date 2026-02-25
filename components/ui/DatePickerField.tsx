// components/ui/DatePickerField.tsx
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

  // Solo mostrar error si el campo fue tocado/interactuado o si hay un error explícito
  const isInvalid = required && value === undefined && touched;
  const displayError =
    error ||
    (isInvalid
      ? "Este campo es obligatorio. Debe seleccionar una fecha o marcar 'No aplica'."
      : undefined);

  // Efecto para sincronizar el input cuando cambia el valor desde fuera
  useEffect(() => {
    if (value && value instanceof Date) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else if (value === null) {
      setInputValue("");
    } else if (value === undefined) {
      setInputValue("");
    }
  }, [value]);

  // Función para validar si una fecha es válida
  const isValidDate = (day: number, month: number, year: number): boolean => {
    // Validar rangos básicos
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Crear fecha y verificar que sea válida
    const date = new Date(year, month - 1, day);

    // Verificar que la fecha creada coincida con los valores ingresados
    // (esto detecta fechas inválidas como 31/02/2024)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // Función para parsear la fecha desde el input solo cuando el usuario termina de escribir
  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString.trim()) return null;

    // Validar formato dd/MM/yyyy
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return null;
    }

    const parts = dateString.split("/");

    // Formato día/mes/año
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    // Validar que la fecha sea válida
    if (!isValidDate(day, month, year)) {
      return null;
    }

    return new Date(year, month - 1, day);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Limpiar error al escribir
    if (validationError) {
      setValidationError("");
    }

    // Permitir borrar todo
    if (newValue === "") {
      setInputValue("");
      setValue(undefined);
      return;
    }

    // --- NORMALIZAR: siempre trabajar a partir sólo de los dígitos que hay en el input ---
    // Esto hace que el formato sea determinista aunque el usuario escriba "/" manualmente o pegue texto.
    const digits = newValue.replace(/\D/g, "").slice(0, 8); // máximo ddMMyyyy

    // Construir el formato de forma consistente:
    // - 1..2 dígitos -> "d" o "dd"
    // - 3 dígitos -> "dd/m"
    // - 4 dígitos -> "dd/mm"
    // - 5+ dígitos -> "dd/mm/yyyy..." (hasta 8 dígitos)
    let formatted = "";
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      // dd + "/" + remaining (1 o 2 dígitos del mes)
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      // dd + "/" + mm + "/" + yyyy-partial
      formatted =
        digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4); // slice(4) puede ser 1..4 dígitos del año
    }

    setInputValue(formatted);

    // Validar si está completo (dd/MM/yyyy)
    if (formatted.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
      const parsedDate = parseDateFromInput(formatted);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        setValue(parsedDate);
        setValidationError("");
      } else {
        setValue(undefined); // completo pero inválido (ej: 30/02/2024)
      }
    } else {
      setValue(undefined); // parcial
    }
  };

  const handleInputBlur = () => {
    setTouched(true);
    setValidationError(""); // Limpiar error antes de procesar

    if (!inputValue.trim()) {
      setValue(undefined);
      return;
    }

    let inputToValidate = inputValue;

    // Normalizar si el formato es parcial pero incluye barras (ej: 1/1/2024)
    const parts = inputValue.split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2].padStart(4, "0");
      // Solo normalizar si el año tiene 4 dígitos (para evitar 1/1/24)
      if (year.length === 4) {
        inputToValidate = `${day}/${month}/${year}`;
      }
    }

    // Validar longitud y formato (debe ser dd/mm/aaaa)
    if (
      inputToValidate.length !== 10 ||
      !/^\d{2}\/\d{2}\/\d{4}$/.test(inputToValidate)
    ) {
      // Si el formato es incorrecto o incompleto, aplicamos la fecha por defecto
      const defaultDate = new Date(2001, 0, 1); // 01/01/2001
      setValue(defaultDate);
      setInputValue(format(defaultDate, "dd/MM/yyyy"));
      return;
    }

    const parsedDate = parseDateFromInput(inputToValidate);

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      // Caso 1: Fecha válida (ej. 10/10/2024)
      setValue(parsedDate);
      // Formatear el input a la versión estándar (ej: 01/01/2024)
      setInputValue(format(parsedDate, "dd/MM/yyyy"));
    } else {
      // Caso 2: Fecha con valores inválidos o fuera de rango (ej. 10/00/2210)

      // Aplicar la fecha por defecto: 01/01/2001
      const defaultDate = new Date(2001, 0, 1); // 01/01/2001

      setValue(defaultDate);
      setInputValue(format(defaultDate, "dd/MM/yyyy"));

      // Si quieres mostrar un mensaje informativo ANTES de sobrescribir,
      // podrías hacerlo con un toast o una lógica de error diferente.
      // Aquí estamos CUMPLIENDO con la instrucción de reemplazar el valor, no dar un error.
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir que el usuario presione Enter para confirmar (trigger handleInputBlur)
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
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className="flex flex-col gap-2">
        {/* Selector de modo: Input o Calendar */}
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

        {/* Modo Input */}
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
          /* Modo Calendar */
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
                  selected={value || undefined}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  defaultMonth={value || new Date()}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={maxYear ?? new Date().getFullYear() + 20}
                  classNames={{
                    caption_label: "hidden",
                    caption:
                      "flex justify-center pt-1 relative items-center mb-2",
                    caption_dropdowns: "flex justify-center gap-2 items-center",
                    nav: "hidden",
                    nav_button: "hidden",
                    nav_button_previous: "hidden",
                    nav_button_next: "hidden",
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

        {/* Checkbox "No aplica" */}
        {showNotApplicable && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Checkbox
              id={`not-applicable-${label.replace(/\s+/g, "-").toLowerCase()}`}
              checked={value === null}
              onCheckedChange={handleNotApplicableChange}
              disabled={busy}
            />
            <label
              htmlFor={`not-applicable-${label.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-sm font-medium leading-none cursor-pointer whitespace-nowrap select-none"
            >
              No aplica
            </label>
          </div>
        )}
      </div>

      {description ? (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      ) : null}
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
    </div>
  );
}
