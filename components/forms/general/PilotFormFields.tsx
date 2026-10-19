"use client";

import { Plane } from "lucide-react";
import { Control } from "react-hook-form";

import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  labelClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { SearchableCombobox } from "@/components/misc/SearchableCombobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PilotFormValues } from "./pilotSchema";

/** Campos compartidos por el alta y la edición de un piloto. */
export function PilotFormFields({
  control,
  disabled,
  employeeOptions,
  employeesLoading,
  employeeLocked,
}: {
  control: Control<PilotFormValues>;
  disabled?: boolean;
  employeeOptions: { id: string; name: string }[];
  employeesLoading?: boolean;
  /** Al editar el empleado es fijo: solo cambia la licencia. */
  employeeLocked?: boolean;
}) {
  return (
    <FormSection compact icon={Plane} title="Piloto">
      <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
        <FormField
          control={control}
          name="employee_dni"
          render={({ field, fieldState }) => (
            <FormItem>
              <FieldLabelRow>
                <FormLabel className={labelClass}>
                  Empleado
                  <RequiredIndicator invalid={!!fieldState.error} />
                </FormLabel>
              </FieldLabelRow>
              <SearchableCombobox
                options={employeeOptions}
                value={field.value}
                onSelect={(option) => field.onChange(`${option.id}`)}
                placeholder="Seleccione un empleado..."
                searchPlaceholder="Buscar por nombre o cédula..."
                emptyLabel="No hay empleados disponibles."
                loading={employeesLoading}
                disabled={disabled || employeeLocked}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="license_number"
          render={({ field, fieldState }) => (
            <FormItem>
              <FieldLabelRow>
                <FormLabel className={labelClass}>
                  Nº de licencia
                  <RequiredIndicator invalid={!!fieldState.error} />
                </FormLabel>
              </FieldLabelRow>
              <FormControl>
                <Input
                  placeholder="Ej: PCA-12345"
                  autoComplete="off"
                  maxLength={255}
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
  );
}
