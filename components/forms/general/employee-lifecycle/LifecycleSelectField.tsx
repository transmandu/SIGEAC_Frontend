"use client";

import { type Control, type FieldValues, type Path } from "react-hook-form";

import {
  hintClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelFieldLabel } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Selector de una lista corta y fija (motivo del cambio, tipo de egreso). */
export function LifecycleSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  required,
  disabled,
  hint,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  options: readonly { id: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <PanelFieldLabel preventClick>
            {label}
            {required && <RequiredIndicator invalid={!!fieldState.error} />}
          </PanelFieldLabel>
          <Select
            value={(field.value as string) || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={cn(selectTriggerClass, "w-full")}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hint && (
            <FormDescription className={hintClass}>{hint}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
