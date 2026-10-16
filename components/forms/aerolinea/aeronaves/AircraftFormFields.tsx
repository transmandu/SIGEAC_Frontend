"use client";

import { useMemo } from "react";
import { Plane, ShieldCheck } from "lucide-react";
import { Control, UseFormReturn, useWatch } from "react-hook-form";

import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { DatePickerField } from "@/components/ui/DatePickerField";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { AIRCRAFT_STATUS_LABELS } from "@/lib/airline-aircraft";
import { useCompanyStore } from "@/stores/CompanyStore";
import { NO_MANUFACTURER, type AircraftFormValues } from "./aircraftSchema";

/**
 * Campos compartidos por el alta y la edición de una aeronave.
 *
 * Van en cuatro columnas dentro de un diálogo ancho: apilados en dos, los doce
 * datos obligaban a desplazarse. `onExternalChange` deja que el alta ajuste el
 * registro INAC al marcar una aeronave como externa.
 */
export function AircraftFormFields({
  form,
  disabled,
  onExternalChange,
}: {
  form: UseFormReturn<AircraftFormValues>;
  disabled?: boolean;
  onExternalChange?: (isExternal: boolean) => void;
}) {
  const control: Control<AircraftFormValues> = form.control;
  const { selectedCompany } = useCompanyStore();
  const { data: locations, isLoading: locationsLoading } =
    useGetLocationsByCompany(selectedCompany?.slug);
  const { data: manufacturers, isLoading: manufacturersLoading } =
    useGetManufacturers(selectedCompany?.slug);

  const aircraftManufacturers = useMemo(
    () => (manufacturers ?? []).filter((m) => m.type === "AIRCRAFT"),
    [manufacturers],
  );

  const isExternal = useWatch({ control, name: "is_external" });

  return (
    <div className="flex flex-col gap-4">
      <FormSection compact icon={Plane} title="Aeronave">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={control}
            name="acronym"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Matrícula
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: YV2272"
                    autoComplete="off"
                    maxLength={8}
                    disabled={disabled}
                    className={`${fieldClass} uppercase`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="serial"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Serial
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: 208B0555"
                    autoComplete="off"
                    maxLength={20}
                    disabled={disabled}
                    className={`${fieldClass} uppercase`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="brand"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Marca
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Cessna"
                    autoComplete="off"
                    maxLength={30}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="model"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Modelo
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Caravan 208B"
                    autoComplete="off"
                    maxLength={30}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="manufacturer_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Fabricante
                    <RequiredIndicator
                      show={!isExternal}
                      invalid={!!fieldState.error}
                    />
                  </FormLabel>
                </FieldLabelRow>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={disabled || manufacturersLoading}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue
                        placeholder={
                          manufacturersLoading ? "Cargando..." : "Seleccione..."
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isExternal && (
                      <SelectItem value={NO_MANUFACTURER}>
                        Sin fabricante
                      </SelectItem>
                    )}
                    {aircraftManufacturers.map((manufacturer) => (
                      <SelectItem
                        key={manufacturer.id}
                        value={String(manufacturer.id)}
                      >
                        {manufacturer.description
                          ? `${manufacturer.name} — ${manufacturer.description}`
                          : manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="location_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Ubicación
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={disabled || locationsLoading}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue
                        placeholder={
                          locationsLoading ? "Cargando..." : "Seleccione..."
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(locations ?? []).map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name || location.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="owner"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Propietario
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Transmandu"
                    autoComplete="off"
                    maxLength={30}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Estado
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(AIRCRAFT_STATUS_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fabricant_date"
            render={({ field, fieldState }) => (
              // `space-y-0`: el campo ya trae su propia separación entre
              // rótulo e input.
              <FormItem className="space-y-0 md:col-span-2">
                <DatePickerField
                  label="Fecha de fabricación"
                  markRequired
                  error={fieldState.error?.message}
                  value={field.value}
                  setValue={(date) =>
                    form.setValue("fabricant_date", date as Date, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  busy={disabled}
                  shortcuts="back"
                  maxYear={new Date().getFullYear()}
                  maxDate={new Date()}
                />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="comments"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                {/* Misma altura de rótulo que `DatePickerField` (16px): comparten
                    fila y con `FieldLabelRow` (24px) el campo quedaba 8px más
                    abajo que la fecha. */}
                <div className="flex h-4 items-center">
                  <FormLabel className={`${labelClass} leading-none`}>
                    Comentarios
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    placeholder="Observaciones sobre la aeronave"
                    autoComplete="off"
                    maxLength={100}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection compact icon={ShieldCheck} title="Registro">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            control={control}
            name="is_external"
            render={({ field }) => (
              <FormItem>
                <CheckboxCard
                  id="aircraft-is-external"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    onExternalChange?.(checked);
                  }}
                  label="Aeronave externa"
                  description="De un tercero: solo sirve para registrar su carga."
                  disabled={disabled}
                />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="inac"
            render={({ field }) => (
              <FormItem>
                <CheckboxCard
                  id="aircraft-inac"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Registrada ante el INAC"
                  description="Aparece en los reportes de SMS."
                  disabled={disabled}
                />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </div>
  );
}
