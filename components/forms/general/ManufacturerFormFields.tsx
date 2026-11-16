"use client";

import { Factory, Tag } from "lucide-react";
import { Control } from "react-hook-form";

import {
  fieldClass,
  hintClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelSection, PanelFieldLabel } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
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
      <PanelSection
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
                <PanelFieldLabel>
                  Abreviatura
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
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
                <PanelFieldLabel>Nombre completo</PanelFieldLabel>
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
      </PanelSection>

      <PanelSection
        icon={Tag}
        title="Clasificación"
        hint="Define en qué selectores aparece el fabricante."
      >
        <FormField
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <FormItem>
              <PanelFieldLabel>
                Tipo
                <RequiredIndicator invalid={!!fieldState.error} />
              </PanelFieldLabel>
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
      </PanelSection>
    </>
  );
}
