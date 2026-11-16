"use client";

import { ShieldCheck } from "lucide-react";
import { Control } from "react-hook-form";

import {
  fieldClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  PanelSection,
  PanelFieldLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ConditionFormValues } from "./conditionSchema";

/** Campos compartidos por el alta y la edición de una condición. */
export function ConditionFormFields({
  control,
  disabled,
}: {
  control: Control<ConditionFormValues>;
  disabled?: boolean;
}) {
  return (
    <PanelSection compact icon={ShieldCheck} title="Condición">
      <div className="space-y-3">
        <FormField
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <PanelFieldLabel>
                Nombre
                <RequiredIndicator invalid={!!fieldState.error} />
              </PanelFieldLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Usado, reparable, resguardo..."
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
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <PanelFieldLabel>
                Descripción
                <RequiredIndicator invalid={!!fieldState.error} />
              </PanelFieldLabel>
              <FormControl>
                <Textarea
                  placeholder="Indica a qué se refiere el nombre..."
                  rows={3}
                  maxLength={500}
                  disabled={disabled}
                  className={textareaClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="excluded_from_cost"
          render={({ field }) => (
            <FormItem>
              <SwitchRow
                id="condition-excluded-from-cost"
                checked={field.value}
                onCheckedChange={field.onChange}
                label="No cuenta como gasto"
                description="Lo que salga en esta condición (ej. resguardo) aparece en los reportes de salidas, marcado, pero no suma al costo."
                disabled={disabled}
              />
            </FormItem>
          )}
        />
      </div>
    </PanelSection>
  );
}
