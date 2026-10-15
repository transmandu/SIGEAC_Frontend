"use client";

import { Warehouse } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { RadioGroup } from "@/components/ui/radio-group";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { cn } from "@/lib/utils";

import { RadioCard } from "@/components/forms/mantenimiento/almacen/_components/RadioCard";
import {
  FormSection,
  fieldClass,
  labelClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

const FIELDS = [
  { name: "sender", label: "Remitente", placeholder: "Nombre del responsable" },
  { name: "origin", label: "Origen", placeholder: "Origen del artículo" },
  {
    name: "destination",
    label: "Destino",
    placeholder: "Destino del artículo",
  },
] as const;

const SOURCE_OPTIONS = [
  {
    value: "COMPANY_PURCHASE",
    label: "Compra de la empresa",
    hint: "La compró la empresa, aunque la compra no esté registrada en el sistema.",
  },
  {
    value: "OTHER",
    label: "Otro origen",
    hint: "Llegó por otra vía: sacado de una aeronave, de un tercero en custodia, etc.",
  },
] as const;

/**
 * Celda de la mitad derecha. El borde izquierdo es la divisoria: el hueco entre
 * filas lo cubre el `pt` de la celda de abajo, así los tramos se tocan y la
 * línea se lee entera en vez de partida.
 */
const rightCellClass = cn(
  "lg:col-span-2 lg:col-start-4",
  "lg:border-l lg:border-slate-400/25 lg:pl-7 dark:lg:border-slate-600/25",
);

/**
 * Procedencia del artículo: quién lo entrega, de dónde viene y a dónde va.
 *
 * Antes solo existía en los formularios de recepción; se muestra en los dos
 * destinos porque el dato es del artículo, no del acto de recepcionarlo.
 */
export const WarehouseDetailsSection = <T extends FieldValues>({
  control,
  receptionDate,
  onReceptionDateChange,
  isEditing,
  disabled,
  source,
  hasSystemOrder,
}: {
  control: Control<T>;
  /** Sin estos dos, la sección omite la fecha. */
  receptionDate?: Date | null;
  onReceptionDateChange?: (date: Date | null | undefined) => void;
  /** Al editar no se rellena nada solo: el valor guardado es el que manda. */
  isEditing?: boolean;
  disabled?: boolean;
  /** Valor vigente del campo, para abrir la justificación cuando es OTHER. */
  source?: string;
  /**
   * El artículo nació de una orden del sistema: la compró la empresa por
   * definición, así que no se pregunta.
   */
  hasSystemOrder?: boolean;
}) => {
  const { getFieldState, trigger } = useFormContext();
  const requiresJustification = !hasSystemOrder && source === "OTHER";

  const textField = (entry: (typeof FIELDS)[number]) => (
    <FormField
      key={entry.name}
      control={control}
      name={entry.name as Path<T>}
      render={({ field }) => (
        <FormItem className="w-full">
          {/* `h-4`: la fecha de recepción lleva la casilla "No aplica" en su
              rótulo, más alta que el texto. Igualando la altura todos los
              inputs de la fila quedan en la misma línea. */}
          <FormLabel className={cn(labelClass, "flex h-4 items-center")}>
            {entry.label}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={entry.placeholder}
              {...field}
              value={field.value ?? ""}
              disabled={disabled}
              className={fieldClass}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Sin FormItem alrededor: añadía un segundo `space-y-2` sobre el que el
  // propio campo ya trae, y separaba de más su input.
  const receptionField = onReceptionDateChange && (
    <DatePickerField
      label="Fecha de recepción"
      value={receptionDate}
      setValue={onReceptionDateChange}
      description={
        isEditing
          ? "Cuándo llegó el artículo al almacén."
          : "Cuándo llegó el artículo al almacén. Viene con la fecha de hoy; cámbiala si llegó otro día."
      }
      busy={disabled}
      shortcuts="back"
      showNotApplicable
      notApplicableInLabel
    />
  );

  const justificationField = (className?: string) => (
    <FormField
      control={control}
      name={"justification" as Path<T>}
      render={({ field, fieldState }) => (
        <FormItem className={cn("w-full", className)}>
          <FormLabel className={cn(labelClass, "flex h-4 items-center")}>
            {requiresJustification ? "¿De dónde viene?" : "Justificación"}
            <RequiredIndicator
              show={requiresJustification}
              invalid={!!fieldState.error}
            />
          </FormLabel>
          <FormControl>
            <Input
              placeholder={
                requiresJustification
                  ? "Ej.: removido de la aeronave YV-1234"
                  : "Motivo del ingreso"
              }
              {...field}
              value={field.value ?? ""}
              disabled={disabled}
              className={fieldClass}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Con orden del sistema no hay procedencia que preguntar, y con ella se va
  // la mitad derecha: sin la divisoria ni la columna aparte, la justificación
  // pasa a ser un campo más de la misma cuadrícula.
  if (hasSystemOrder) {
    return (
      <FormSection
        icon={Warehouse}
        title="Detalles de almacén"
        hint="Quién entrega el artículo y a dónde va dentro de la empresa."
      >
        <div className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {FIELDS.map(textField)}
          {receptionField}
          {justificationField("lg:col-span-2")}
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection
      icon={Warehouse}
      title="Detalles de almacén"
      hint="Procedencia y destino del artículo dentro de la empresa."
    >
      {/* Cada campo es una celda del MISMO grid, no de una columna apilada por
          lado: con las dos mitades compartiendo filas, los rótulos de la
          segunda arrancan a la misma altura por definición de CSS Grid, sin
          depender de cuánto mida cada control.

          Cada bloque declara su fila y su columna: el acomodo automático los
          repartiría por orden de aparición y la mitad derecha dejaría de
          enfrentarse con la izquierda. */}
      <div className="grid grid-cols-1 gap-x-7 gap-y-5 lg:grid-cols-5 lg:grid-rows-2 lg:gap-y-0">
        <div className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2 lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:pb-5">
          {FIELDS.slice(0, 2).map(textField)}
        </div>

        <FormField
          control={control}
          name={"source" as Path<T>}
          render={({ field, fieldState }) => (
            <FormItem
              className={cn("w-full", rightCellClass, "lg:row-start-1 lg:pb-5")}
            >
              <FormLabel className={cn(labelClass, "flex h-4 items-center")}>
                Procedencia
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    // La regla de la justificación depende de esta opción:
                    // sin revalidarla, el aviso de "obligatoria" seguía en
                    // pantalla aunque ya se hubiera elegido otra.
                    if (getFieldState("justification").error) {
                      void trigger("justification");
                    }
                  }}
                  value={field.value ?? ""}
                  disabled={disabled}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <RadioCard
                      key={option.value}
                      id={`source-${option.value.toLowerCase()}`}
                      value={option.value}
                      checked={field.value === option.value}
                      label={option.label}
                      hint={option.hint}
                      disabled={disabled}
                      invalid={!!fieldState.error}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2 lg:col-span-3 lg:col-start-1 lg:row-start-2">
          {textField(FIELDS[2])}
          {receptionField}
        </div>

        {justificationField(cn(rightCellClass, "lg:row-start-2"))}
      </div>
    </FormSection>
  );
};
