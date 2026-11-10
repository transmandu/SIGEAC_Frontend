"use client";

import { Control, useWatch } from "react-hook-form";
import { MapPin } from "lucide-react";

import {
  fieldClass,
  hintClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  PanelFieldLabel,
  PanelSection,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Location } from "@/types";
import { baseKindLabel, type LocationFormValues } from "./locationSchema";

/** Campos compartidos por el alta y la edición de una sede. */
export function LocationFormFields({
  control,
  disabled,
  mainBase,
}: {
  control: Control<LocationFormValues>;
  disabled?: boolean;
  /** La base principal que ya existe (distinta de la que se edita), si la hay. */
  mainBase?: Location;
}) {
  const isMainBase = useWatch({ control, name: "isMainBase" });

  return (
    <PanelSection
      icon={MapPin}
      title="Sede"
      hint="Dónde está y cómo se reconoce en los selectores del sistema."
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <FormField
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem>
                <PanelFieldLabel>
                  Ciudad o dirección
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Puerto Ordaz"
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
            name="cod_iata"
            render={({ field, fieldState }) => (
              <FormItem>
                <PanelFieldLabel>
                  Código IATA
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: PZO"
                    autoComplete="off"
                    maxLength={3}
                    disabled={disabled}
                    className={cn(
                      fieldClass,
                      "font-mono tracking-widest uppercase",
                    )}
                    {...field}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          .replace(/[^A-Za-z]/g, "")
                          .toUpperCase(),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <PanelFieldLabel>Nombre de la sede (opcional)</PanelFieldLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Edificio Norte"
                  autoComplete="off"
                  maxLength={255}
                  disabled={disabled}
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormDescription className={hintClass}>
                Para distinguirla si hay otra sede en la misma ciudad. Sin
                nombre, se reconoce por la ciudad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="isMainBase"
          render={({ field }) => (
            <FormItem className="border-t pt-4">
              <SwitchRow
                id="location-is-main-base"
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Es la base principal"
                description={
                  mainBase
                    ? `Ya existe una base principal: ${mainBase.cod_iata} - ${mainBase.address}. Para designar otra, cambie primero esa a base alterna.`
                    : `Se registrará como ${baseKindLabel(isMainBase)}. Solo puede haber una base principal; las demás sedes son alternas.`
                }
                disabled={disabled || !!mainBase}
              />
            </FormItem>
          )}
        />
      </div>
    </PanelSection>
  );
}
