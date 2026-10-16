"use client";

import { Factory, Tag } from "lucide-react";
import { Control } from "react-hook-form";

import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
  FormDescription,
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
import {
  MANUFACTURER_TYPE_LABELS,
  type ManufacturerFormValues,
} from "./manufacturerSchema";

/** Campos compartidos por el alta y la edición de un fabricante. */
export function ManufacturerFormFields({
  control,
  disabled,
}: {
  control: Control<ManufacturerFormValues>;
  disabled?: boolean;
}) {
  return (
    <>
      <FormSection
        icon={Factory}
        title="Identificación"
        hint="Cómo se conoce al fabricante en el sistema."
      >
        <div className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Abreviatura
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Boeing, Airbus, GE"
                    autoComplete="off"
                    maxLength={255}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormDescription className={hintClass}>
                  Se guarda en mayúsculas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Nombre completo</FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: The Boeing Company"
                    autoComplete="off"
                    maxLength={255}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormDescription className={hintClass}>
                  Opcional. Se muestra como nombre completo en el listado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection
        icon={Tag}
        title="Clasificación"
        hint="Define en qué selectores aparece el fabricante."
      >
        <FormField
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <FormItem>
              <FieldLabelRow>
                <FormLabel className={labelClass}>
                  Tipo
                  <RequiredIndicator invalid={!!fieldState.error} />
                </FormLabel>
              </FieldLabelRow>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Seleccione el tipo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(MANUFACTURER_TYPE_LABELS).map(
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
      </FormSection>
    </>
  );
}
