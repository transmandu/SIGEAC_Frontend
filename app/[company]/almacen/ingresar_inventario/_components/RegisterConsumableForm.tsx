"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import {
  Calculator,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  FileUpIcon,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  useConfirmIncomingArticle,
  useCreateArticle,
  useUpdateArticle,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";

import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import { MultiInputField } from "@/components/misc/MultiInputField";
import { useGetConversionByUnitConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableUnit";
import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading2.gif";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Convertion } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { EditingArticle } from "@/components/forms/mantenimiento/almacen/RegisterArticleForm";
import PreviewCreateConsumableDialog from "@/components/dialogs/mantenimiento/almacen/PreviewCreateConsumableDialog";

/* ------------------------------- Schema ------------------------------- */

const fileMaxBytes = 10_000_000; // 10 MB

const formSchema = z.object({
  part_number: z
    .string({ message: "Debe ingresar un número de parte." })
    .min(2, {
      message: "El número de parte debe contener al menos 2 caracteres.",
    }),
  lot_number: z.string().optional(),
  alternative_part_number: z
    .array(
      z.string().min(2, {
        message: "Cada número alterno debe contener al menos 2 caracteres.",
      }),
    )
    .optional(),
  description: z.string().optional(),
  batch_name: z.string().optional(),
  zone: z.string().optional(),
  expiration_date: z.string().optional(),
  fabrication_date: z.string().optional(),
  manufacturer_id: z.string().optional(),
  condition_id: z.string().min(1, "Debe ingresar la condición del artículo."),
  quantity: z.coerce
    .number({ message: "Debe ingresar una cantidad." })
    .min(0, { message: "No puede ser negativo." })
    .refine((val) => !isNaN(val), {
      message: "Debe ser un número válido",
    }),
  min_quantity: z.coerce
    .number()
    .min(0, { message: "No puede ser negativo." })
    .optional(),
  batch_id: z
    .string({ message: "Debe ingresar un lote." })
    .min(1, "Seleccione un lote"),
  certificate_8130: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  certificate_fabricant: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  certificate_vendor: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  image: z.instanceof(File).optional(),
  conversion_id: z.number().optional(),
  primary_unit_id: z.number().optional(),
  has_documentation: z.boolean().optional(),
  shelf_life: z.string().optional(),
  inspector: z.string().optional(),
  inspect_date: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface UnitSelection {
  conversion_id: number;
}

/* ----------------------------- Helpers UI ----------------------------- */

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

function FileField({
  form,
  name,
  label,
  accept = ".pdf,image/*",
  description,
  busy,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: React.ReactNode;
  accept?: string;
  description?: string;
  busy?: boolean;
}) {
  const fileValue = form.watch(name as any);
  const fileName = fileValue instanceof File ? fileValue.name : "";

  const handleClearFile = (inputRef: HTMLInputElement | null) => {
    if (inputRef) {
      inputRef.value = "";
    }
    form.setValue(name as any, undefined as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <FormField
      control={form.control}
      name={name as any}
      render={() => {
        let inputRef: HTMLInputElement | null = null;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
                <Input
                  ref={(el) => {
                    inputRef = el;
                  }}
                  type="file"
                  accept={accept}
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      form.setValue(name as any, f as any, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  className="hidden"
                  id={`file-input-${name}`}
                />
                <div
                  onClick={() => !busy && !fileName && inputRef?.click()}
                  className={`flex items-center justify-between pl-10 pr-3 py-2 w-full border border-gray-300 rounded ${
                    !busy && !fileName
                      ? "cursor-pointer hover:border-gray-400"
                      : ""
                  } ${busy ? "opacity-50" : ""}`}
                >
                  <span
                    className={`text-sm truncate flex-1 ${fileName ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {fileName || "Ningún archivo seleccionado"}
                  </span>
                  {fileName && !busy && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFile(inputRef);
                      }}
                      className="ml-2 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Eliminar archivo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-600"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </FormControl>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Helper function to check if date is the "Not Applicable" date (1900-01-01)
const isNotApplicableDate = (date: Date | null | undefined): boolean => {
  if (!date || !(date instanceof Date)) return false;
  return (
    date.getFullYear() === 1900 && date.getMonth() === 0 && date.getDate() === 1
  );
};

function DatePickerField({
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
}: {
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
}) {
  const [touched, setTouched] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isInputMode, setIsInputMode] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

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

  const handleInputBlur = () => {
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
  };

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
      setValue(new Date(1900, 0, 1)); // 1900-01-01 for "Not Applicable"
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
    <FormItem className="flex flex-col p-0 mt-2.5 w-full">
      <FormLabel>
        {label}
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
                    {value === null ? (
                      <span>N/A</span>
                    ) : value && isNotApplicableDate(value) ? (
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

        {showNotApplicable && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Checkbox
              id={`not-applicable-${label.replace(/\s+/g, "-").toLowerCase()}`}
              checked={value !== undefined && isNotApplicableDate(value)}
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

      {description ? <FormDescription>{description}</FormDescription> : null}
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

/* ----------------------------- Modal Unidades ----------------------------- */

function UnitsModal({
  open,
  onOpenChange,
  secondaryUnits,
  selectedUnits,
  onSelectedUnitsChange,
  primaryUnit,
  allUnits,
  availableConversionUnits,
  availableConversion,
  onConversionResult,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secondaryUnits: Convertion[];
  selectedUnits: UnitSelection[];
  onSelectedUnitsChange: (units: UnitSelection[]) => void;
  primaryUnit?: any;
  allUnits?: any[];
  availableConversionUnits?: {
    id: number;
    value: string;
    label: string;
    registered_by: string;
    updated_by: string | null;
  }[];
  availableConversion?: any[];
  onConversionResult?: (result: string) => void;
}) {
  const [currentUnitId, setCurrentUnitId] = useState<number | "">("");
  const [showConversionForm, setShowConversionForm] = useState(false);
  const [conversionFromUnit, setConversionFromUnit] = useState<string>("");
  const [conversionToUnit, setConversionToUnit] = useState<string>("");
  const [conversionQuantity, setConversionQuantity] = useState<string>("");
  const [conversionResult, setConversionResult] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);

  const availableUnits = availableConversion?.filter(
    (unit) =>
      !selectedUnits.some((selected) => selected.conversion_id === unit.id),
  );

  const calculateConversionLocally = useCallback(() => {
    if (!conversionFromUnit || !conversionToUnit || !conversionQuantity) {
      setConversionResult("");
      onConversionResult?.("");
      return;
    }

    const quantity = parseFloat(conversionQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setConversionResult("");
      onConversionResult?.("");
      return;
    }

    setIsCalculating(true);

    const conversion = availableConversion?.find(
      (conv: any) =>
        conv.primary_unit.id.toString() === conversionFromUnit &&
        conv.secondary_unit.id.toString() === conversionToUnit,
    );

    if (conversion && conversion.equivalence) {
      const result = quantity / conversion.equivalence;
      const resultValue = result.toFixed(6).replace(/\.?0+$/, "");

      setConversionResult(resultValue);
      onConversionResult?.(resultValue);
    } else {
      setConversionResult("No se encontró conversión");
      onConversionResult?.("No se encontró conversión");
    }

    setIsCalculating(false);
  }, [
    conversionFromUnit,
    conversionToUnit,
    conversionQuantity,
    availableConversion,
    onConversionResult,
  ]);

  useEffect(() => {
    calculateConversionLocally();
  }, [calculateConversionLocally]);

  useEffect(() => {
    if (primaryUnit?.id) {
      setConversionToUnit(primaryUnit.id.toString());
    }
  }, [primaryUnit]);

  const addUnit = () => {
    if (!currentUnitId) return;

    const newUnit: UnitSelection = {
      conversion_id: currentUnitId as number,
    };

    const updatedUnits = [...selectedUnits, newUnit];
    onSelectedUnitsChange(updatedUnits);
    setCurrentUnitId("");
  };

  const removeUnit = (unitId: number) => {
    const updatedUnits = selectedUnits.filter(
      (unit) => unit.conversion_id !== unitId,
    );
    onSelectedUnitsChange(updatedUnits);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Configurar Conversiones de Unidades</DialogTitle>
          <DialogDescription>
            Seleccione las conversiones de unidades adicionales para este
            artículo o cree nuevas conversiones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Conversiones Existentes</h3>
            <Button
              onClick={() => setShowConversionForm(!showConversionForm)}
              variant="outline"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {showConversionForm ? "Cancelar" : "Conversión"}
            </Button>
          </div>

          {showConversionForm && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Desde Unidad</label>
                  <Select
                    value={conversionFromUnit}
                    onValueChange={setConversionFromUnit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableConversionUnits?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.label} ({unit.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-lg font-semibold">→</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hacia Unidad</label>
                  <Select
                    value={conversionToUnit}
                    onValueChange={setConversionToUnit}
                    disabled={true}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {primaryUnit
                          ? `${primaryUnit.label} (${primaryUnit.value})`
                          : "Seleccione unidad primaria"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {primaryUnit && (
                        <SelectItem value={primaryUnit.id.toString()}>
                          {primaryUnit.label} ({primaryUnit.value})
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Ej: 100"
                    value={conversionQuantity}
                    onChange={(e) => setConversionQuantity(e.target.value)}
                    min="0"
                    step="0.001"
                  />
                </div>

                <div className="flex items-end">
                  {isCalculating && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Calculando...</span>
                    </div>
                  )}
                </div>
              </div>

              {conversionFromUnit &&
                conversionToUnit &&
                availableConversion && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Conversión: {conversionQuantity || "0"}{" "}
                      {
                        availableConversionUnits?.find(
                          (u) => u.id.toString() === conversionFromUnit,
                        )?.label
                      }{" "}
                      → {conversionResult} {primaryUnit?.label}
                      {availableConversion.find(
                        (conv: any) =>
                          conv.primary_unit.id.toString() ===
                            conversionFromUnit &&
                          conv.secondary_unit.id.toString() ===
                            conversionToUnit,
                      )?.equivalence && (
                        <span className="block text-xs mt-1">
                          Equivalencia: 1{" "}
                          {
                            availableConversionUnits?.find(
                              (u) => u.id.toString() === conversionFromUnit,
                            )?.label
                          }{" "}
                          ={" "}
                          {1 /
                            availableConversion.find(
                              (conv: any) =>
                                conv.primary_unit.id.toString() ===
                                  conversionFromUnit &&
                                conv.secondary_unit.id.toString() ===
                                  conversionToUnit,
                            )!.equivalence}{" "}
                          {primaryUnit?.label}
                        </span>
                      )}
                    </p>
                  </div>
                )}

              {conversionResult &&
                !isCalculating &&
                conversionResult !== "No se encontró conversión" && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Resultado de la Conversión
                      </label>
                      <Input
                        type="text"
                        value={conversionResult}
                        readOnly
                        className="bg-white font-semibold"
                        placeholder="El resultado aparecerá aquí..."
                      />
                      <p className="text-sm text-muted-foreground">
                        {conversionQuantity}{" "}
                        {availableConversionUnits?.find(
                          (u) => u.id.toString() === conversionFromUnit,
                        )?.label || conversionFromUnit}{" "}
                        = {conversionResult}{" "}
                        {primaryUnit?.label || "unidad primaria"}
                      </p>
                    </div>
                  </div>
                )}

              {conversionResult === "No se encontró conversión" && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">
                    No se encontró una conversión definida para estas unidades.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Elegir Conversiones Para Despacho
              </label>
              <Select
                value={currentUnitId.toString()}
                onValueChange={(value) =>
                  setCurrentUnitId(value ? parseInt(value) : "")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una conversión" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits?.map((conversion) => (
                    <SelectItem
                      key={conversion.id}
                      value={conversion.id.toString()}
                    >
                      {conversion.primary_unit?.label}
                      <span className="text-light ml-1">
                        ({conversion.primary_unit?.value})
                      </span>
                      {conversion.secondary_unit?.label &&
                        ` - ${conversion.secondary_unit.label} (${conversion.secondary_unit.value})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={addUnit} disabled={!currentUnitId}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Conversiones seleccionadas:</h4>
            {selectedUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No hay conversiones seleccionadas
              </p>
            ) : (
              <div className="space-y-2">
                {selectedUnits.map((unit) => {
                  const conversionInfo = secondaryUnits.find(
                    (u) => u.id === unit.conversion_id,
                  );
                  return (
                    <div
                      key={unit.conversion_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          {conversionInfo?.primary_unit.label}
                          {conversionInfo?.secondary_unit?.label &&
                            ` (${conversionInfo.secondary_unit.label})`}
                        </span>
                        {conversionInfo?.equivalence && (
                          <span className="text-sm text-muted-foreground">
                            Equivalencia: {conversionInfo.equivalence}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnit(unit.conversion_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Componente Principal ----------------------------- */

export default function CreateConsumableForm({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedCompany, selectedStation } = useCompanyStore();

  const [partNumberToSearch, setPartNumberToSearch] = useState<
    string | undefined
  >(undefined);

  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<UnitSelection[]>([]);

  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
    refetch: refetchBatches,
  } = useGetBatchesByCategory("CONSUMABLE");
  const {
    data: manufacturers,
    isLoading: isManufacturerLoading,
    isError: isManufacturerError,
  } = useGetManufacturers(selectedCompany?.slug);

  const {
    data: conditions,
    isLoading: isConditionsLoading,
    error: isConditionsError,
  } = useGetConditions();

  const { data: units, isLoading: unitsLoading } = useGetUnits(
    selectedCompany?.slug,
  );

  const { data: secondaryUnits, isLoading: secondaryUnitsLoading } =
    useGetSecondaryUnits(selectedCompany?.slug);

  const [selectedPrimaryUnit, setSelectedPrimaryUnit] = useState<any | null>(
    initialData?.primary_unit_id ? { id: initialData.primary_unit_id } : null,
  );

  const { data: availableConversion, isLoading: isConversionLoading } =
    useGetConversionByUnitConsmable(
      selectedPrimaryUnit?.id || 0,
      selectedCompany?.slug,
    );

  const primaryUnitsFromConversions = useMemo(() => {
    if (!availableConversion) return [];
    const unitMap = new Map();
    availableConversion.forEach((conversion) => {
      const unit = conversion.primary_unit;
      if (!unitMap.has(unit.id)) {
        unitMap.set(unit.id, unit);
      }
    });
    return Array.from(unitMap.values());
  }, [availableConversion]);

  const { data: searchResults, isFetching: isSearching } =
    useSearchBatchesByPartNumber(
      selectedCompany?.slug,
      selectedStation || undefined,
      partNumberToSearch,
      "CONSUMIBLE",
    );

  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [secondarySelected, setSecondarySelected] = useState<any | null>(
    initialData?.primary_unit_id ? { id: initialData.primary_unit_id } : null,
  );
  const [secondaryQuantity, setSecondaryQuantity] = useState<
    number | undefined
  >();
  const [caducateDate, setCaducateDate] = useState<Date | null | undefined>(
    initialData?.consumable?.expiration_date
      ? parseISO(initialData.consumable.expiration_date)
      : undefined,
  );

  const [shelfDate, setShelfDate] = useState<Date | null | undefined>(
    initialData?.consumable?.shelf_life
      ? parseISO(initialData.consumable.shelf_life)
      : undefined,
  );

  const [inspectDate, setInspectDate] = useState<Date | null | undefined>(
    initialData?.inspect_date ? parseISO(initialData.inspect_date) : undefined,
  );

  const [fabricationDate, setFabricationDate] = useState<
    Date | null | undefined
  >(
    initialData?.consumable?.fabrication_date
      ? parseISO(initialData?.consumable?.fabrication_date)
      : undefined,
  );
  const [enableBatchNameEdit, setEnableBatchNameEdit] = useState(false);

  const handleFabricationDateChange = (d?: Date | null) => {
    setFabricationDate(d ?? undefined);
  };

  const handleCaducateDateChange = (d?: Date | null) => {
    if (d === null) {
      setCaducateDate(null);
    } else if (d === undefined) {
      setCaducateDate(undefined);
    } else {
      setCaducateDate(d);
    }
  };

  const handleShelfDateChange = (d?: Date | null) => {
    if (d === null) {
      setShelfDate(null);
    } else if (d === undefined) {
      setShelfDate(undefined);
    } else {
      setShelfDate(d);
    }
  };

  const handleInspectDateChange = (d?: Date | null) => {
    if (d === null) {
      setInspectDate(null);
    } else if (d === undefined) {
      setInspectDate(undefined);
    } else {
      setInspectDate(d);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      batch_id: initialData?.batches?.id?.toString() || "",
      batch_name: initialData?.batches?.name || "",
      manufacturer_id: initialData?.manufacturer?.id?.toString() || "",
      condition_id: initialData?.condition?.id?.toString() || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      lot_number: initialData?.consumable?.lot_number || "",
      expiration_date: initialData?.consumable?.expiration_date || undefined,
      fabrication_date: initialData?.consumable?.fabrication_date || undefined,
      quantity: initialData?.consumable?.quantity ?? 0,
      min_quantity: initialData?.consumable?.min_quantity
        ? Number(initialData.consumable.min_quantity)
        : undefined,
      primary_unit_id: initialData?.primary_unit_id || undefined,
      has_documentation: initialData?.has_documentation || false,
      inspector: initialData?.inspector || "",
      inspect_date: initialData?.inspect_date
        ? initialData?.inspect_date
        : undefined,
      shelf_life: initialData?.consumable?.shelf_life || undefined,
    },
    mode: "onBlur",
  });

  const hasDocumentation = form.watch("has_documentation");

  useEffect(() => {
    if (!initialData) return;

    const initialQuantity = initialData.consumable?.quantity ?? 0;
    setSecondaryQuantity(initialQuantity);

    // ✅ Convertimos a Date SOLO para el DatePicker
    const expirationDate = initialData?.consumable?.expiration_date
      ? parseISO(initialData.consumable.expiration_date)
      : undefined;

    const fabricationDateParsed = initialData?.consumable?.fabrication_date
      ? parseISO(initialData.consumable.fabrication_date)
      : undefined;

    const shelfLifeDate = initialData?.consumable?.shelf_life
      ? parseISO(initialData.consumable.shelf_life)
      : undefined;

    // ✅ Convertimos a string SOLO para RHF
    const expirationDateStr = expirationDate
      ? format(expirationDate, "yyyy-MM-dd")
      : undefined;

    const fabricationDateStr = fabricationDateParsed
      ? format(fabricationDateParsed, "yyyy-MM-dd")
      : undefined;

    const shelfLifeDateStr = shelfLifeDate
      ? format(shelfLifeDate, "yyyy-MM-dd")
      : undefined;

    const resetValues = {
      part_number: initialData.part_number ?? "",
      alternative_part_number: initialData.alternative_part_number ?? [],
      batch_id: initialData.batches?.id?.toString() ?? "",
      batch_name: initialData.batches?.name ?? "",
      manufacturer_id: initialData.manufacturer?.id?.toString() ?? "",
      condition_id: initialData.condition?.id?.toString() ?? "",
      description: initialData.description ?? "",
      zone: initialData.zone ?? "",
      lot_number: initialData.consumable?.lot_number ?? "",

      // 🔥 RHF RECIBE STRING → ya no hay error TS
      expiration_date: expirationDateStr,
      fabrication_date: fabricationDateStr,
      shelf_life: shelfLifeDateStr,

      quantity: initialQuantity,
      min_quantity:
        initialData.consumable?.min_quantity !== undefined &&
        initialData.consumable?.min_quantity !== null
          ? Number(initialData.consumable.min_quantity)
          : undefined,

      primary_unit_id: initialData?.primary_unit_id || undefined,
      has_documentation: initialData.has_documentation ?? false,
    };

    form.reset(resetValues);

    // 🔥 MUY IMPORTANTE → sincroniza los DatePickers
    setCaducateDate(expirationDate);
    setFabricationDate(fabricationDateParsed);
    setShelfDate(shelfLifeDate);

    if (initialData.primary_unit_id) {
      const unitObj = { id: initialData.primary_unit_id };
      setSelectedPrimaryUnit(unitObj);
      setSecondarySelected(unitObj);
    }
  }, [initialData, form]); // 👈 quitamos form para evitar renders extra

  const calculateAndUpdateQuantity = useCallback(
    (quantity: number | undefined, selectedUnit: any) => {
      if (quantity === undefined || quantity === null) {
        form.setValue("quantity", 0, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }
      form.setValue("quantity", quantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  useEffect(() => {
    if (!secondarySelected || secondaryQuantity === undefined) {
      return;
    }
    calculateAndUpdateQuantity(secondaryQuantity, secondarySelected);
  }, [secondarySelected, secondaryQuantity, calculateAndUpdateQuantity]);

  const handleConversionResult = (result: string) => {
    const resultNumber = parseFloat(result);
    if (!isNaN(resultNumber)) {
      setSecondaryQuantity(resultNumber);
      calculateAndUpdateQuantity(resultNumber, secondarySelected);
    }
  };

  useEffect(() => {
    if (!secondarySelected) {
      return;
    }
    setSelectedPrimaryUnit(secondarySelected);
    form.setValue("primary_unit_id", secondarySelected.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [secondarySelected, form]);

  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !isEditing) {
      const firstResult = searchResults[0];
      form.setValue("batch_id", firstResult.id.toString(), {
        shouldValidate: true,
      });
    }
  }, [searchResults, form, isEditing]);

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  const busy =
    isBatchesLoading ||
    isManufacturerLoading ||
    isConditionsLoading ||
    createArticle.isPending ||
    confirmIncoming.isPending ||
    updateArticle.isPending;

  const batchNameById = useMemo(() => {
    const map = new Map<string, string>();
    batches?.forEach((b) => map.set(String(b.id), b.name));
    return map;
  }, [batches]);

  const sortedBatches = useMemo(() => {
    if (!batches) return [];
    if (!searchResults || searchResults.length === 0) return batches;

    const searchIds = new Set(searchResults.map((r) => r.id));
    const foundBatches = batches.filter((b) => searchIds.has(b.id));
    const otherBatches = batches.filter((b) => !searchIds.has(b.id));

    return [...foundBatches, ...otherBatches];
  }, [batches, searchResults]);

  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState<FormValues | null>(null);

  async function onSubmit(values: FormValues) {
    const rawValues = form.getValues();
    setPreviewData(rawValues);
    setOpenPreview(true);
  }

  async function submitToBackend(values: FormValues) {
    if (!selectedCompany?.slug) return;

    const { expiration_date: _, ...valuesWithoutCaducateDate } = values;

    // Format dates for backend
    const caducateDateStr: string | undefined =
      caducateDate && !isNotApplicableDate(caducateDate)
        ? format(caducateDate, "yyyy-MM-dd")
        : caducateDate && isNotApplicableDate(caducateDate)
          ? "1900-01-01"
          : undefined;

    const shelfDateStr: string | undefined =
      shelfDate && !isNotApplicableDate(shelfDate)
        ? format(shelfDate, "yyyy-MM-dd")
        : shelfDate && isNotApplicableDate(shelfDate)
          ? "1900-01-01"
          : undefined;

    const inspectDateStr: string | undefined =
      inspectDate && !isNotApplicableDate(inspectDate)
        ? format(inspectDate, "yyyy-MM-dd")
        : inspectDate && isNotApplicableDate(inspectDate)
          ? "1900-01-01"
          : undefined;

    const formattedValues: Omit<FormValues, "expiration_date"> & {
      expiration_date?: string;
      fabrication_date?: string;
      shelf_life?: string;
      inspect_date?: string;
      part_number: string;
      article_type: string;
      status: string;
      alternative_part_number?: string[];
      batch_name?: string;
      conversions?: UnitSelection[];
      primary_unit_id?: number;
    } = {
      ...valuesWithoutCaducateDate,
      status: "CHECKING",
      part_number: normalizeUpper(values.part_number),
      article_type: "consumable",
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      expiration_date: caducateDateStr,
      shelf_life: shelfDateStr,
      inspect_date: inspectDateStr,
      fabrication_date:
        fabricationDate &&
        fabricationDate !== null &&
        !isNotApplicableDate(fabricationDate)
          ? format(fabricationDate, "yyyy-MM-dd")
          : fabricationDate && isNotApplicableDate(fabricationDate)
            ? "1900-01-01"
            : undefined,
      batch_name: enableBatchNameEdit ? values.batch_name : undefined,
      conversions: selectedUnits.length > 0 ? selectedUnits : undefined,
      primary_unit_id: secondarySelected?.id,
    };

    if (isEditing && initialData) {
      await updateArticle.mutateAsync({
        data: { ...formattedValues },
        id: initialData?.id,
        company: selectedCompany.slug,
      });
      router.push(`/${selectedCompany.slug}/ingenieria/confirmar_inventario`);
    } else {
      await createArticle.mutateAsync({
        company: selectedCompany.slug,
        data: formattedValues,
      });

      setSecondaryQuantity(undefined);
      setSecondarySelected(null);
      setSelectedPrimaryUnit(null);
      setFabricationDate(undefined);
      setCaducateDate(undefined);
      setShelfDate(undefined);
      setInspectDate(undefined);
      setSelectedUnits([]);

      form.reset();
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 max-w-7xl mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <SectionCard title="Registrar consumible">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="inspector"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Inspector (Incoming)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del Inspector" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormItem className="w-full">
                <DatePickerField
                  label="Fecha de Incoming"
                  value={inspectDate}
                  setValue={handleInspectDateChange}
                  description="Fecha de Incoming"
                  busy={busy}
                  shortcuts="forward"
                  showNotApplicable={true}
                  required={true}
                />
              </FormItem>
              <FormField
                control={form.control}
                name="part_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nro. de parte</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 234ABAC"
                        {...field}
                        disabled={busy || isSearching}
                        onBlur={(e) => {
                          const normalized = normalizeUpper(e.target.value);
                          field.onChange(normalized);
                          if (
                            normalized &&
                            normalized.length >= 2 &&
                            !isEditing
                          ) {
                            setPartNumberToSearch(normalized);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificador principal del artículo.
                      {isSearching && (
                        <span className="text-primary ml-2">Buscando...</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternative_part_number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MultiInputField
                        values={field.value || []}
                        onChange={(vals) =>
                          field.onChange(
                            vals.map((v: string) => normalizeUpper(v)),
                          )
                        }
                        placeholder="Ej: 234ABAC"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lot_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nro. de lote</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: LOTE123"
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>Lote del consumible.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 w-full xl:col-span-3">
                <FormField
                  control={form.control}
                  name="batch_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3 mt-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <FormLabel>Descripción de Consumible</FormLabel>
                        <CreateBatchDialog
                          onSuccess={async (batchName) => {
                            await queryClient.invalidateQueries({
                              queryKey: [
                                "search-batches",
                                selectedCompany?.slug,
                                selectedStation,
                                "consumable",
                              ],
                            });
                            const { data: updatedBatches } =
                              await refetchBatches();
                            const newBatch = updatedBatches?.find(
                              (b: any) => b.name === batchName,
                            );
                            if (newBatch) {
                              form.setValue(
                                "batch_id",
                                newBatch.id.toString(),
                                { shouldValidate: true },
                              );
                            }
                          }}
                          defaultCategory="CONSUMABLE"
                          triggerButton={
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Crear nuevo
                            </Button>
                          }
                        />
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={
                                isBatchesLoading || isBatchesError || busy
                              }
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {isBatchesLoading && (
                                <Loader2 className="size-4 animate-spin mr-2" />
                              )}
                              {field.value ? (
                                <p className="truncate flex-1 text-left">
                                  {batchNameById.get(field.value) ?? ""}
                                </p>
                              ) : (
                                <span className="truncate">
                                  Elegir descripción...
                                </span>
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput
                              placeholder="Buscar descripción..."
                              onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  const selected = e.currentTarget
                                    .closest("[cmdk-root]")
                                    ?.querySelector(
                                      '[cmdk-item][aria-selected="true"]',
                                    ) as HTMLElement;
                                  if (selected) {
                                    selected.click();
                                  } else {
                                    const firstItem = e.currentTarget
                                      .closest("[cmdk-root]")
                                      ?.querySelector(
                                        '[cmdk-item]:not([data-disabled="true"])',
                                      ) as HTMLElement;
                                    if (firstItem) {
                                      firstItem.click();
                                    }
                                  }
                                }
                              }}
                            />
                            <CommandList>
                              <CommandEmpty className="text-xs p-2 text-center">
                                Sin resultados
                              </CommandEmpty>
                              {searchResults && searchResults.length > 0 && (
                                <CommandGroup heading="Coincidencias encontradas">
                                  {searchResults.map((batch) => (
                                    <CommandItem
                                      value={`${batch.name}`}
                                      key={batch.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "batch_id",
                                          batch.id.toString(),
                                          { shouldValidate: true },
                                        );
                                        if (isEditing && enableBatchNameEdit) {
                                          form.setValue(
                                            "batch_name",
                                            batch.name,
                                            { shouldValidate: true },
                                          );
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${batch.id}` === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <p className="font-semibold text-primary">
                                        {batch.name}
                                      </p>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                              <CommandGroup
                                heading={
                                  searchResults && searchResults.length > 0
                                    ? "Otras descripciones"
                                    : "Todas las descripciones"
                                }
                              >
                                {sortedBatches
                                  ?.filter(
                                    (batch) =>
                                      !searchResults?.some(
                                        (sr) => sr.id === batch.id,
                                      ),
                                  )
                                  .map((batch) => (
                                    <CommandItem
                                      value={`${batch.name}`}
                                      key={batch.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "batch_id",
                                          batch.id.toString(),
                                          { shouldValidate: true },
                                        );
                                        if (isEditing && enableBatchNameEdit) {
                                          form.setValue(
                                            "batch_name",
                                            batch.name,
                                            { shouldValidate: true },
                                          );
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${batch.id}` === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <p>{batch.name}</p>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Descripción del consumible a registrar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEditing && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable-batch-edit"
                        checked={enableBatchNameEdit}
                        onCheckedChange={(checked) =>
                          setEnableBatchNameEdit(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="enable-batch-edit"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        ¿Modificar la descripción del artículo?
                      </label>
                    </div>
                    {enableBatchNameEdit && (
                      <FormField
                        control={form.control}
                        name="batch_name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Nuevo nombre sugerido</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Escriba el nuevo nombre para la descripción"
                                {...field}
                                disabled={busy}
                              />
                            </FormControl>
                            <FormDescription>
                              Ingrese el nuevo nombre para esta descripción de
                              artículo.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Propiedades">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="condition_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Condición</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isConditionsLoading || busy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isConditionsLoading
                                ? "Cargando..."
                                : "Seleccione..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            const focused =
                              document.activeElement as HTMLElement;
                            if (focused?.getAttribute("role") === "option") {
                              const enterEvent = new KeyboardEvent("keydown", {
                                key: "Enter",
                                code: "Enter",
                                keyCode: 13,
                                bubbles: true,
                                cancelable: true,
                              });
                              focused.dispatchEvent(enterEvent);
                            } else {
                              const firstItem = e.currentTarget.querySelector(
                                '[role="option"]:not([data-disabled="true"])',
                              ) as HTMLElement;
                              if (firstItem) {
                                firstItem.focus();
                                const enterEvent = new KeyboardEvent(
                                  "keydown",
                                  {
                                    key: "Enter",
                                    code: "Enter",
                                    keyCode: 13,
                                    bubbles: true,
                                    cancelable: true,
                                  },
                                );
                                firstItem.dispatchEvent(enterEvent);
                              }
                            }
                          }
                        }}
                      >
                        {conditions?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                        {isConditionsError && (
                          <div className="p-2 text-sm text-muted-foreground">
                            Error al cargar condiciones.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Estado del artículo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manufacturer_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center justify-between">
                      <FormLabel>Fabricante</FormLabel>
                      <CreateManufacturerDialog
                        defaultType="PART"
                        onSuccess={(manufacturer) => {
                          if (manufacturer?.id) {
                            form.setValue(
                              "manufacturer_id",
                              manufacturer.id.toString(),
                              { shouldValidate: true },
                            );
                          }
                        }}
                        triggerButton={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Crear nuevo
                          </Button>
                        }
                      />
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={
                              isManufacturerLoading ||
                              isManufacturerError ||
                              busy
                            }
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {isManufacturerLoading && (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            )}
                            {field.value ? (
                              <p>
                                {
                                  manufacturers
                                    ?.filter((m) => m.type)
                                    .find((m) => `${m.id}` === field.value)
                                    ?.name
                                }
                              </p>
                            ) : (
                              "Seleccione fabricante..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar fabricante..."
                            onKeyDown={(e) => {
                              if (e.key === "Tab") {
                                e.preventDefault();
                                const selected = e.currentTarget
                                  .closest("[cmdk-root]")
                                  ?.querySelector(
                                    '[cmdk-item][aria-selected="true"]',
                                  ) as HTMLElement;
                                if (selected) {
                                  selected.click();
                                } else {
                                  const firstItem = e.currentTarget
                                    .closest("[cmdk-root]")
                                    ?.querySelector(
                                      '[cmdk-item]:not([data-disabled="true"])',
                                    ) as HTMLElement;
                                  if (firstItem) {
                                    firstItem.click();
                                  }
                                }
                              }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty className="text-xs p-2 text-center">
                              No se encontró el fabricante.
                            </CommandEmpty>
                            <CommandGroup>
                              {manufacturers
                                ?.filter((m) => m.type)
                                .map((manufacturer) => (
                                  <CommandItem
                                    value={`${manufacturer.name}`}
                                    key={manufacturer.id}
                                    onSelect={() => {
                                      form.setValue(
                                        "manufacturer_id",
                                        manufacturer.id.toString(),
                                        { shouldValidate: true },
                                      );
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        `${manufacturer.id}` === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <p>
                                      {manufacturer.name} ({manufacturer.type})
                                    </p>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Marca específica del artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Ubicación interna</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Pasillo 4, repisa 3..."
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>Zona física en almacén.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Fechas del Consumible">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerField
                label="Fecha de Fabricación"
                value={fabricationDate}
                setValue={handleFabricationDateChange}
                description="Fecha de fabricación del Consumible."
                busy={busy}
                shortcuts="back"
                maxYear={new Date().getFullYear()}
                showNotApplicable={true}
              />

              <DatePickerField
                label="Próximo Vencimiento"
                value={caducateDate}
                setValue={handleCaducateDateChange}
                description="Proximo Vencimiento"
                busy={busy}
                shortcuts="forward"
                showNotApplicable={true}
                required={true}
              />
            </div>
          </SectionCard>

          <SectionCard title="Shelf Life">
            <DatePickerField
              label="Shelf Life"
              value={shelfDate}
              setValue={handleShelfDateChange}
              description="Tiempo de Almacenamiento"
              busy={busy}
              shortcuts="forward"
              showNotApplicable={true}
              required={true}
            />
          </SectionCard>

          <SectionCard title="Ingreso y cantidad">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2 mt-2.5">
                <FormLabel>Método de ingreso</FormLabel>
                <Popover open={secondaryOpen} onOpenChange={setSecondaryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={unitsLoading || busy}
                      variant="outline"
                      role="combobox"
                      aria-expanded={secondaryOpen}
                      className="justify-between"
                    >
                      {secondarySelected
                        ? `${secondarySelected.label}`
                        : unitsLoading
                          ? "Cargando..."
                          : "Seleccione una unidad"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar unidad..."
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            const selected = e.currentTarget
                              .closest("[cmdk-root]")
                              ?.querySelector(
                                '[cmdk-item][aria-selected="true"]',
                              ) as HTMLElement;
                            if (selected) {
                              selected.click();
                            } else {
                              const firstItem = e.currentTarget
                                .closest("[cmdk-root]")
                                ?.querySelector(
                                  '[cmdk-item]:not([data-disabled="true"])',
                                ) as HTMLElement;
                              if (firstItem) {
                                firstItem.click();
                              }
                            }
                          }
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          No existen unidades disponibles.
                        </CommandEmpty>
                        <CommandGroup>
                          {units?.map((unit) => (
                            <CommandItem
                              key={unit.id}
                              value={unit.label}
                              onSelect={(val) => {
                                const found =
                                  units.find(
                                    (u) =>
                                      u.label.toLowerCase() ===
                                      val.toLowerCase(),
                                  ) || null;
                                setSecondarySelected(found);
                                setSelectedPrimaryUnit(found);
                                setSecondaryOpen(false);

                                if (found && secondaryQuantity !== undefined) {
                                  form.setValue("quantity", secondaryQuantity, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }
                              }}
                            >
                              <span className="flex-1">{unit.label}</span>
                              <Check
                                className={cn(
                                  "ml-2",
                                  secondarySelected?.id.toString() ===
                                    unit.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  Seleccione la unidad para el ingreso del artículo.
                </p>
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        disabled={busy}
                        value={
                          secondaryQuantity !== undefined
                            ? secondaryQuantity.toString()
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            setSecondaryQuantity(undefined);
                            field.onChange(0);
                            return;
                          }

                          const sanitizedValue = value
                            .replace(/[^0-9.,]/g, "")
                            .replace(",", ".");

                          const n = parseFloat(sanitizedValue);
                          if (Number.isNaN(n) || n < 0) {
                            return;
                          }

                          setSecondaryQuantity(n);
                          field.onChange(n);
                        }}
                        placeholder="Ej: 15.7, 20.5, 3.14..."
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad según método de ingreso seleccionado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cantidad Mínima</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ej: 5"
                        value={
                          field.value !== undefined
                            ? field.value.toString()
                            : ""
                        }
                        disabled={busy}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            field.onChange(undefined);
                            return;
                          }

                          const sanitizedValue = value
                            .replace(/[^0-9.,]/g, "")
                            .replace(",", ".");

                          const n = parseFloat(sanitizedValue);
                          if (Number.isNaN(n) || n < 0) {
                            return;
                          }

                          field.onChange(n);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad mínima de stock para alertas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1 md:col-span-2 xl:col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUnitsModalOpen(true)}
                  disabled={
                    busy || !secondaryUnits?.length || !selectedPrimaryUnit
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Conversiones Adicionales
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedUnits.length > 0
                    ? `${selectedUnits.length} conversión(es) configurada(s)`
                    : !selectedPrimaryUnit
                      ? "Seleccione primero una unidad primaria"
                      : "Configure conversiones de unidades adicionales para este artículo"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Detalles y documentos">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles/Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Ej: Fluido hidráulico MIL-PRF-83282..."
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>
                      Observaciones sobre el artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FileField
                    form={form}
                    name="image"
                    label="Imagen del artículo"
                    accept="image/*"
                    description="Imagen descriptiva."
                    busy={busy}
                  />

                  <FormField
                    control={form.control}
                    name="has_documentation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={busy}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            ¿El artículo tiene documentación?
                          </FormLabel>
                          <FormDescription></FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                {hasDocumentation && (
                  <div className="space-y-4">
                    <FileField
                      form={form}
                      name="certificate_8130"
                      label={
                        <span>
                          Certificado{" "}
                          <span className="text-primary font-semibold">
                            8130
                          </span>
                        </span>
                      }
                      description="PDF o imagen. Máx. 10 MB."
                      busy={busy}
                    />
                    <FileField
                      form={form}
                      name="certificate_fabricant"
                      label={
                        <span>
                          Certificado del{" "}
                          <span className="text-primary">fabricante</span>
                        </span>
                      }
                      description="PDF o imagen. Máx. 10 MB."
                      busy={busy}
                    />
                    <FileField
                      form={form}
                      name="certificate_vendor"
                      label={
                        <span>
                          Certificado del{" "}
                          <span className="text-primary">vendedor</span>
                        </span>
                      }
                      description="PDF o imagen. Máx. 10 MB."
                      busy={busy}
                    />
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <div className="flex items-center gap-3">
            <Button
              className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={
                busy ||
                !selectedCompany ||
                !form.getValues("part_number") ||
                !form.getValues("batch_id") ||
                !selectedPrimaryUnit ||
                caducateDate === undefined
              }
              type="submit"
            >
              {busy ? (
                <Image
                  className="text-black"
                  src={loadingGif}
                  width={170}
                  height={170}
                  alt="Cargando..."
                />
              ) : (
                <span>
                  {isEditing ? "Confirmar ingreso" : "Crear artículo"}
                </span>
              )}
            </Button>

            {busy && (
              <div className="inline-flex items-center text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando…
              </div>
            )}
          </div>
        </form>
      </Form>

      <PreviewCreateConsumableDialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        values={previewData}
        onConfirm={(vals) => {
          setOpenPreview(false);
          submitToBackend(vals as unknown as FormValues);
        }}
      />

      <UnitsModal
        open={unitsModalOpen}
        onOpenChange={setUnitsModalOpen}
        secondaryUnits={secondaryUnits || []}
        selectedUnits={selectedUnits}
        onSelectedUnitsChange={setSelectedUnits}
        primaryUnit={selectedPrimaryUnit}
        allUnits={units}
        availableConversionUnits={primaryUnitsFromConversions}
        availableConversion={availableConversion}
        onConversionResult={handleConversionResult}
      />
    </>
  );
}
