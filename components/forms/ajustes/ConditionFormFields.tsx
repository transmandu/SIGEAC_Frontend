"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { ConditionFormValues } from "./conditionSchema";

/** Campos compartidos por el alta y la edición de una condición. */
export function ConditionFormFields({
  control,
}: {
  control: Control<ConditionFormValues>;
}) {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input
                className="dark:bg-black/30"
                placeholder="EJ: Usado, reparable, resguardo..."
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                className="dark:bg-black/30"
                placeholder="Indica a qué se refiere el nombre..."
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="excluded_from_cost"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                No cuenta como gasto
              </FormLabel>
              <p className="text-xs text-muted-foreground">
                Lo que salga en esta condición (ej. resguardo) aparece en los
                reportes de salidas, marcado, pero no suma al costo.
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
