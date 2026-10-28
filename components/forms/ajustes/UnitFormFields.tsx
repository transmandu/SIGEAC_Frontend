"use client";

import { Control } from "react-hook-form";

import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  hintClass,
  labelClass,
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
import { Ruler, Split, Tag } from "lucide-react";
import type { UnitFormValues } from "./unitSchema";

/** Campos compartidos por el alta y la edición de una unidad. */
export function UnitFormFields({
  control,
  disabled,
}: {
  control: Control<UnitFormValues>;
  disabled?: boolean;
}) {
  return (
    <>
      <FormSection
        icon={Tag}
        title="Identificación"
        hint="Cómo se nombra y se escribe la unidad en los artículos."
      >
        <div className="space-y-4">
          <FormField
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Nombre
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Kilogramo, Litro, Mililitro"
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
          <FormField
            control={control}
            name="value"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Símbolo
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Kg, L, mL"
                    autoComplete="off"
                    maxLength={50}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormDescription className={hintClass}>
                  Abreviatura que acompaña a las cantidades.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection
        icon={Ruler}
        title="Medidas"
        hint="Solo para unidades de longitud o área."
      >
        <FormField
          control={control}
          name="is_dimensional"
          render={({ field }) => (
            <FormItem>
              <CheckboxCard
                id="unit-is-dimensional"
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Sirve para declarar medidas"
                description="Habilita esta unidad para dimensionar artículos que se despachan en trazos (láminas, telas, rollos)."
                disabled={disabled}
              />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection
        icon={Split}
        title="Fracciones"
        hint="Para unidades que almacén despacha por partes, como el galón."
      >
        <FormField
          control={control}
          name="allows_fractions"
          render={({ field }) => (
            <FormItem>
              <CheckboxCard
                id="unit-allows-fractions"
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Se despacha por fracciones"
                description="En las salidas aparecen los atajos 1/2, 1/4, 1/8, 1/16 y 1/32, y se puede escribir «1/2». Los reportes siguen mostrando la cantidad en decimal."
                disabled={disabled}
              />
            </FormItem>
          )}
        />
      </FormSection>
    </>
  );
}
