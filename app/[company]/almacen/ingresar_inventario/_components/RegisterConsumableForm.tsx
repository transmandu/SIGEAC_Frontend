"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { format } from "date-fns";
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
import { EditingArticle } from "./RegisterArticleForm";
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
      })
    )
    .optional(),
  description: z.string().optional(),
  batch_name: z.string().optional(),
  zone: z.string().optional(),
  caducate_date: z.string().optional(),
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
    // Limpiar el input de archivo
    if (inputRef) {
      inputRef.value = "";
    }
    // Limpiar el valor en el formulario
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
                  ref={(el) => { inputRef = el; }}
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
                    !busy && !fileName ? "cursor-pointer hover:border-gray-400" : ""
                  } ${busy ? "opacity-50" : ""}`}
                >
                  <span className={`text-sm truncate flex-1 ${fileName ? "text-gray-900" : "text-gray-500"}`}>
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

  // Función para parsear la fecha desde el input solo cuando el usuario termina de escribir
  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString.trim()) return null;

    // Intentar diferentes formatos de fecha
    const formats = [
      /^\d{2}\/\d{2}\/\d{4}$/, // dd/MM/yyyy
      /^\d{2}-\d{2}-\d{4}$/, // dd-MM-yyyy
      /^\d{4}-\d{2}-\d{2}$/, // yyyy-MM-dd
      /^\d{2}\/\d{2}\/\d{2}$/, // dd/MM/yy
    ];

    let parsedDate: Date | null = null;

    for (const format of formats) {
      if (format.test(dateString)) {
        // Para formato dd/MM/yyyy o dd-MM-yyyy
        if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split(/[\/-]/);
          parsedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        }
        // Para formato yyyy-MM-dd
        else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          const [year, month, day] = dateString.split("-");
          parsedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        }
        // Para formato dd/MM/yy (año corto)
        else if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateString)) {
          const [day, month, year] = dateString.split("/");
          const fullYear = 2000 + parseInt(year); // Asumir siglo 21
          parsedDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          break;
        }
      }
    }

    // Si no coincide con ningún formato conocido, intentar parsear directamente
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
    }

    return parsedDate;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // NO establecer el valor aquí, solo cuando el usuario termine de escribir
  };

  const handleInputBlur = () => {
    setTouched(true);

    if (!inputValue.trim()) {
      setValue(undefined);
      return;
    }

    const parsedDate = parseDateFromInput(inputValue);
    if (parsedDate) {
      setValue(parsedDate);
      // Formatear la fecha correctamente después de validar
      setInputValue(format(parsedDate, "dd/MM/yyyy"));
    } else {
      // Si no es una fecha válida, mantener el input pero mostrar error
      // El usuario puede seguir editando
      console.log("Fecha inválida, manteniendo input para edición");
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir que el usuario presione Enter para confirmar
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
    setTouched(true);
  };

  return (
    <FormItem className="flex flex-col p-0 mt-2.5 w-full">
      <FormLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>

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
              placeholder="Formato: dd/MM/yyyy"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleInputKeyPress}
              disabled={busy || (showNotApplicable && value === null)}
              className={cn("flex-1", isInvalid && "border-destructive")}
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
                <FormControl>
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

      {description ? <FormDescription>{description}</FormDescription> : null}
      {displayError && (
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
  availableConversion, // Agregar esta prop
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
  availableConversion?: any[]; // Agregar el tipo para availableConversion
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
      !selectedUnits.some((selected) => selected.conversion_id === unit.id)
  );

  // Función para calcular la conversión localmente usando las equivalencias
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

    // Buscar la conversión que coincida con las unidades seleccionadas
    const conversion = availableConversion?.find(
      (conv: any) =>
        conv.primary_unit.id.toString() === conversionFromUnit &&
        conv.secondary_unit.id.toString() === conversionToUnit
    );

    if (conversion && conversion.equivalence) {
      // Calcular: cantidad / equivalencia
      const result = quantity / conversion.equivalence;
      const resultValue = result.toFixed(6).replace(/\.?0+$/, ""); // Limitar decimales y quitar ceros innecesarios

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

  // Calcular automáticamente cuando cambian los valores
  useEffect(() => {
    calculateConversionLocally();
  }, [calculateConversionLocally]);

  // Efecto para actualizar automáticamente la unidad destino cuando cambia la unidad primaria
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
      (unit) => unit.conversion_id !== unitId
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
          {/* Botón para crear nueva conversión */}
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

          {/* Formulario para crear nueva conversión */}
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

              {/* Mostrar información de la conversión */}
              {conversionFromUnit &&
                conversionToUnit &&
                availableConversion && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Conversión: {conversionQuantity || "0"}{" "}
                      {
                        availableConversionUnits?.find(
                          (u) => u.id.toString() === conversionFromUnit
                        )?.label
                      }{" "}
                      → {conversionResult} {primaryUnit?.label}
                      {availableConversion.find(
                        (conv: any) =>
                          conv.primary_unit.id.toString() ===
                            conversionFromUnit &&
                          conv.secondary_unit.id.toString() === conversionToUnit
                      )?.equivalence && (
                        <span className="block text-xs mt-1">
                          Equivalencia: 1{" "}
                          {
                            availableConversionUnits?.find(
                              (u) => u.id.toString() === conversionFromUnit
                            )?.label
                          }{" "}
                          ={" "}
                          {1 /
                            availableConversion.find(
                              (conv: any) =>
                                conv.primary_unit.id.toString() ===
                                  conversionFromUnit &&
                                conv.secondary_unit.id.toString() ===
                                  conversionToUnit
                            )!.equivalence}{" "}
                          {primaryUnit?.label}
                        </span>
                      )}
                    </p>
                  </div>
                )}

              {/* Input para mostrar el resultado de la conversión */}
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
                          (u) => u.id.toString() === conversionFromUnit
                        )?.label || conversionFromUnit}{" "}
                        = {conversionResult}{" "}
                        {primaryUnit?.label || "unidad primaria"}
                      </p>
                    </div>
                  </div>
                )}

              {/* Mensaje de error */}
              {conversionResult === "No se encontró conversión" && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">
                    No se encontró una conversión definida para estas unidades.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resto del componente igual... */}
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
                    (u) => u.id === unit.conversion_id
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

/* ----------------------------- Componente ----------------------------- */

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

  // Local state for part number search
  const [partNumberToSearch, setPartNumberToSearch] = useState<
    string | undefined
  >(undefined);

  // Modal state
  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<UnitSelection[]>([]);

  // Data hooks
  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
    refetch: refetchBatches,
  } = useGetBatchesByCategory("consumible");
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

  // USAR useGetUnits para el método de ingreso
  const { data: units, isLoading: unitsLoading } = useGetUnits(
    selectedCompany?.slug
  );

  // Mantener useGetSecondaryUnits solo para el modal de conversiones adicionales
  const { data: secondaryUnits, isLoading: secondaryUnitsLoading } =
    useGetSecondaryUnits(selectedCompany?.slug);

  // Estado para la unidad primaria seleccionada
  const [selectedPrimaryUnit, setSelectedPrimaryUnit] = useState<any | null>(
    initialData?.primary_unit_id ? { id: initialData.primary_unit_id } : null
  );

  // Conversiones posibles según la unidad primaria seleccionada
  const { data: availableConversion, isLoading: isConversionLoading } =
    useGetConversionByUnitConsmable(
      selectedPrimaryUnit?.id || 0, // Usar 0 o un valor por defecto cuando no hay selección
      selectedCompany?.slug
    );

  // Extraer unidades primarias únicas de las conversiones disponibles
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

  // Search batches by part number
  const { data: searchResults, isFetching: isSearching } =
    useSearchBatchesByPartNumber(
      selectedCompany?.slug,
      selectedStation || undefined,
      partNumberToSearch,
      "CONSUMIBLE"
    );

  // Mutations
  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

  // Local UI state
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [secondarySelected, setSecondarySelected] = useState<any | null>(
    initialData?.primary_unit_id ? { id: initialData.primary_unit_id } : null
  );
  const [secondaryQuantity, setSecondaryQuantity] = useState<
    number | undefined
  >();
  const [caducateDate, setCaducateDate] = useState<Date | null | undefined>(
    initialData?.consumable?.caducate_date
      ? new Date(initialData.consumable.caducate_date)
      : undefined
  );
  const [fabricationDate, setFabricationDate] = useState<
    Date | null | undefined
  >(
    initialData?.consumable?.fabrication_date
      ? new Date(initialData?.consumable?.fabrication_date)
      : undefined
  );
  const [enableBatchNameEdit, setEnableBatchNameEdit] = useState(false);

  // Wrapper functions for DatePickerField compatibility
  const handleFabricationDateChange = (d?: Date | null) => {
    setFabricationDate(d ?? undefined);
  };

  const handleCaducateDateChange = (d?: Date | null) => {
    // Preserve null value to indicate "Not applicable"
    if (d === null) {
      setCaducateDate(null); // ← CAMBIAR undefined por null
    } else if (d === undefined) {
      setCaducateDate(undefined);
    } else {
      setCaducateDate(d);
    }
  };
  // Form
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
      caducate_date: initialData?.consumable?.caducate_date || undefined,
      fabrication_date: initialData?.consumable?.fabrication_date || undefined,
      quantity: initialData?.consumable?.quantity ?? 0,
      min_quantity: initialData?.consumable?.min_quantity
        ? Number(initialData.consumable.min_quantity)
        : undefined,
      primary_unit_id: initialData?.primary_unit_id || undefined,
      has_documentation: initialData?.has_documentation || false,
    },
    mode: "onBlur",
  });

  const hasDocumentation = form.watch("has_documentation"); // 2. **useEffect para la documentación**

  // Reset si cambia initialData
  useEffect(() => {
    if (!initialData) return;
    form.reset({
      part_number: initialData.part_number ?? "",
      alternative_part_number: initialData.alternative_part_number ?? [],
      batch_id: initialData.batches?.id?.toString() ?? "",
      batch_name: initialData.batches?.name ?? "",
      manufacturer_id: initialData.manufacturer?.id?.toString() ?? "",
      condition_id: initialData.condition?.id?.toString() ?? "",
      description: initialData.description ?? "",
      zone: initialData.zone ?? "",
      lot_number: initialData.consumable?.lot_number ?? "",
      caducate_date: initialData?.consumable?.caducate_date || undefined,
      fabrication_date: initialData?.consumable?.fabrication_date || undefined,
      quantity: initialData.consumable?.quantity ?? 0,
      min_quantity: initialData.consumable?.min_quantity
        ? Number(initialData.consumable.min_quantity)
        : undefined,
      primary_unit_id: initialData?.primary_unit_id || undefined,
      has_documentation: initialData.has_documentation ?? false,
    });

    // Establecer la unidad primaria seleccionada si existe en initialData
    if (initialData.primary_unit_id) {
      setSelectedPrimaryUnit({ id: initialData.primary_unit_id });
      setSecondarySelected({ id: initialData.primary_unit_id });
    }
  }, [initialData, form]);

  // Función para calcular y actualizar la cantidad
  const calculateAndUpdateQuantity = useCallback(
    (quantity: number | undefined, selectedUnit: any) => {
      if (quantity === undefined) {
        form.setValue("quantity", 0, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      if (selectedUnit) {
        form.setValue("quantity", quantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        form.setValue("quantity", quantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [form]
  );

  // Modificar el efecto existente para calcular la cantidad
  useEffect(() => {
    if (secondarySelected && secondaryQuantity !== undefined) {
      calculateAndUpdateQuantity(secondaryQuantity, secondarySelected);
    }
  }, [secondarySelected, secondaryQuantity, calculateAndUpdateQuantity]);

  // Función para manejar el resultado de la conversión desde el modal
  const handleConversionResult = (result: string) => {
    const resultNumber = parseFloat(result);
    if (!isNaN(resultNumber)) {
      setSecondaryQuantity(resultNumber);
      calculateAndUpdateQuantity(resultNumber, secondarySelected);
    }
  };

  // Efecto para actualizar selectedPrimaryUnit cuando cambia secondarySelected
  useEffect(() => {
    if (secondarySelected) {
      setSelectedPrimaryUnit(secondarySelected);
      form.setValue("primary_unit_id", secondarySelected.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [secondarySelected, form]);

  // Autocompletar descripción cuando encuentra resultados de búsqueda
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !isEditing) {
      const firstResult = searchResults[0];
      form.setValue("batch_id", firstResult.id.toString(), {
        shouldValidate: true,
      });

      if (searchResults.length === 1) {
        console.log("✓ Descripción autocompletada");
      } else {
        console.log(
          `✓ Se encontraron ${searchResults.length} descripciones. Se seleccionó la primera.`
        );
      }
    } else if (
      searchResults &&
      searchResults.length === 0 &&
      partNumberToSearch
    ) {
      console.log("No se encontraron descripciones para este part number");
    }
  }, [searchResults, form, isEditing, partNumberToSearch]);

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

  // Ordenar batches: primero los resultados de búsqueda, luego el resto
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

    const { caducate_date: _, ...valuesWithoutCaducateDate } = values;

    // USAR ESTA LÍNEA QUE SÍ FUNCIONA:
    const caducateDateStr: string | undefined =
      caducateDate && caducateDate !== null
        ? format(caducateDate, "yyyy-MM-dd")
        : undefined;

    const formattedValues: Omit<FormValues, "caducate_date"> & {
      caducate_date?: string; // ← MANTENER solo string | undefined
      fabrication_date?: string;
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
      article_type: "consumible",
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      caducate_date: caducateDateStr, // Solo string o undefined
      fabrication_date:
        fabricationDate && fabricationDate !== null
          ? format(fabricationDate, "yyyy-MM-dd")
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
      form.reset();
      setFabricationDate(undefined);
      setCaducateDate(undefined);
      setSecondarySelected(null);
      setSecondaryQuantity(undefined);
      setSelectedUnits([]);
      setSelectedPrimaryUnit(null);
    }
  }

  /* -------------------------------- UI -------------------------------- */
  return (
    <>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 max-w-7xl mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Encabezado */}
          <SectionCard title="Registrar consumible">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
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
                            vals.map((v: string) => normalizeUpper(v))
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
                            // Invalidar la query y refetch para obtener el batch recién creado
                            await queryClient.invalidateQueries({
                              queryKey: [
                                "search-batches",
                                selectedCompany?.slug,
                                selectedStation,
                                "consumible",
                              ],
                            });
                            const { data: updatedBatches } =
                              await refetchBatches();
                            const newBatch = updatedBatches?.find(
                              (b: any) => b.name === batchName
                            );
                            if (newBatch) {
                              form.setValue(
                                "batch_id",
                                newBatch.id.toString(),
                                { shouldValidate: true }
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
                                isBatchesLoading || isBatchesError || busy
                              }
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
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
                                  const selected = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item][aria-selected="true"]') as HTMLElement;
                                  if (selected) {
                                    selected.click();
                                  } else {
                                    const firstItem = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item]:not([data-disabled="true"])') as HTMLElement;
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
                                          { shouldValidate: true }
                                        );
                                        if (isEditing && enableBatchNameEdit) {
                                          form.setValue(
                                            "batch_name",
                                            batch.name,
                                            { shouldValidate: true }
                                          );
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${batch.id}` === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
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
                                        (sr) => sr.id === batch.id
                                      )
                                  )
                                  .map((batch) => (
                                    <CommandItem
                                      value={`${batch.name}`}
                                      key={batch.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "batch_id",
                                          batch.id.toString(),
                                          { shouldValidate: true }
                                        );
                                        if (isEditing && enableBatchNameEdit) {
                                          form.setValue(
                                            "batch_name",
                                            batch.name,
                                            { shouldValidate: true }
                                          );
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${batch.id}` === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
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

          {/* Propiedades */}
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
                            const focused = document.activeElement as HTMLElement;
                            if (focused?.getAttribute('role') === 'option') {
                              // Simular Enter en el elemento seleccionado
                              const enterEvent = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                bubbles: true,
                                cancelable: true
                              });
                              focused.dispatchEvent(enterEvent);
                            } else {
                              // Si no hay elemento enfocado, enfocar y seleccionar el primero
                              const firstItem = e.currentTarget.querySelector('[role="option"]:not([data-disabled="true"])') as HTMLElement;
                              if (firstItem) {
                                firstItem.focus();
                                const enterEvent = new KeyboardEvent('keydown', {
                                  key: 'Enter',
                                  code: 'Enter',
                                  keyCode: 13,
                                  bubbles: true,
                                  cancelable: true
                                });
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
                              { shouldValidate: true }
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
                              !field.value && "text-muted-foreground"
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
                                const selected = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item][aria-selected="true"]') as HTMLElement;
                                if (selected) {
                                  selected.click();
                                } else {
                                  const firstItem = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item]:not([data-disabled="true"])') as HTMLElement;
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
                                        { shouldValidate: true }
                                      );
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        `${manufacturer.id}` === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
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

          {/* Fechas y límites */}
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
              />

              <DatePickerField
                label="Fecha de Caducidad - Shelf-Life"
                value={caducateDate}
                setValue={handleCaducateDateChange}
                description="Fecha límite del Consumible en Almacen."
                busy={busy}
                shortcuts="forward"
                showNotApplicable={true}
                required={true}
              />
            </div>
          </SectionCard>

          {/* Ingreso y cantidad */}
          <SectionCard title="Ingreso y cantidad">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Método de ingreso (unidades primarias) */}
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
                            const selected = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item][aria-selected="true"]') as HTMLElement;
                            if (selected) {
                              selected.click();
                            } else {
                              const firstItem = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-item]:not([data-disabled="true"])') as HTMLElement;
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
                                  units.find((u) => u.label.toLowerCase() === val.toLowerCase()) ||
                                  null;
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
                                    : "opacity-0"
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

              {/* Cantidad */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        disabled={busy}
                        min="0"
                        step="any" // ← CAMBIAR A "any"
                        value={secondaryQuantity ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            setSecondaryQuantity(undefined);
                            calculateAndUpdateQuantity(
                              undefined,
                              secondarySelected
                            );
                            field.onChange(0);
                            return;
                          }

                          const n = parseFloat(value);
                          if (!Number.isNaN(n) && n < 0) return;

                          const newQuantity = Number.isNaN(n) ? undefined : n;
                          setSecondaryQuantity(newQuantity);

                          calculateAndUpdateQuantity(
                            newQuantity,
                            secondarySelected
                          );
                          field.onChange(newQuantity || 0);
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

              {/* Cantidad mínima */}
              <FormField
                control={form.control}
                name="min_quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cantidad Mínima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ej: 5"
                        {...field}
                        disabled={busy}
                        onChange={(e) => {
                          const n = parseFloat(e.target.value);
                          if (!Number.isNaN(n) && n < 0) return;
                          field.onChange(e.target.value === "" ? undefined : n);
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

              {/* Botón para configurar conversiones adicionales */}
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

          {/* Detalles y archivos */}
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

          {/* Acciones */}
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
                <span>{isEditing ? "Confirmar ingreso" : "Crear artículo"}</span>
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
        values={previewData} // puede ser null antes de abrir
        onConfirm={(vals) => {
          setOpenPreview(false);
          submitToBackend(vals as unknown as FormValues); // aquí va tu función que maneja el submit real
        }}
      />


      {/* Modal de Configuración de Conversiones */}
      <UnitsModal
        open={unitsModalOpen}
        onOpenChange={setUnitsModalOpen}
        secondaryUnits={secondaryUnits || []}
        selectedUnits={selectedUnits}
        onSelectedUnitsChange={setSelectedUnits}
        primaryUnit={selectedPrimaryUnit}
        allUnits={units}
        availableConversionUnits={primaryUnitsFromConversions}
        availableConversion={availableConversion} // ← Agregar esta línea
        onConversionResult={handleConversionResult}
      />
    </>
  );
}
