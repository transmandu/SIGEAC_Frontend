"use client";

import { Building2 } from "lucide-react";
import { Control } from "react-hook-form";

import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
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
import { getThirdPartyTypeLabel } from "@/lib/utils";
import {
  THIRD_PARTY_TYPE_OPTIONS,
  type ThirdPartyFormValues,
} from "./thirdPartySchema";

/** Campos compartidos por el alta y la edición de un tercero. */
export function ThirdPartyFormFields({
  control,
  disabled,
}: {
  control: Control<ThirdPartyFormValues>;
  disabled?: boolean;
}) {
  return (
    <FormSection compact icon={Building2} title="Identificación">
      <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
        <FormField
          control={control}
          name="name"
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
                  placeholder="Ej: Empresa ABC S.A."
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
          name="type"
          render={({ field, fieldState }) => {
            // Un tipo heredado fuera de la lista se conserva para no borrarlo al editar.
            const legacy =
              field.value &&
              !THIRD_PARTY_TYPE_OPTIONS.some(
                (option) => option.value === field.value,
              );

            return (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Tipo
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccione el tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {THIRD_PARTY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    {legacy && (
                      <SelectItem value={field.value}>
                        {getThirdPartyTypeLabel(field.value)}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </FormSection>
  );
}
