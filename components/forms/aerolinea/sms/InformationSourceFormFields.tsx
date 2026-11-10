"use client";

import { Radar } from "lucide-react";
import { Control } from "react-hook-form";

import {
  fieldClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelSection, PanelFieldLabel } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
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
  INFORMATION_SOURCE_TYPES,
  type InformationSourceFormValues,
} from "./informationSourceSchema";

/** Campos compartidos por el alta y la edición de una fuente de información. */
export function InformationSourceFormFields({
  control,
  disabled,
}: {
  control: Control<InformationSourceFormValues>;
  disabled?: boolean;
}) {
  return (
    <PanelSection compact icon={Radar} title="Fuente">
      <div className="grid gap-3 md:grid-cols-[1fr_13rem]">
        <FormField
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <PanelFieldLabel>
                Nombre de la fuente
                <RequiredIndicator invalid={!!fieldState.error} />
              </PanelFieldLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Inspección, auditoría interna"
                  autoComplete="off"
                  maxLength={50}
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
          render={({ field, fieldState }) => (
            <FormItem>
              <PanelFieldLabel>
                Tipo
                <RequiredIndicator invalid={!!fieldState.error} />
              </PanelFieldLabel>
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
                  {INFORMATION_SOURCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </PanelSection>
  );
}
