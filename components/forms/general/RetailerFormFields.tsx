"use client";

import { MapPin, Store } from "lucide-react";
import { Control } from "react-hook-form";

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
import type { RetailerFormValues } from "./retailerSchema";

/** Campos compartidos por el alta y la edición de un comercio. */
export function RetailerFormFields({
  control,
  disabled,
}: {
  control: Control<RetailerFormValues>;
  disabled?: boolean;
}) {
  return (
    <>
      <FormSection
        icon={Store}
        title="Identificación"
        hint="Tienda física o sitio en línea donde se compra."
      >
        <FormField
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FieldLabelRow>
                <FormLabel className={labelClass}>
                  Nombre del comercio
                  <RequiredIndicator invalid={!!fieldState.error} />
                </FormLabel>
              </FieldLabelRow>
              <FormControl>
                <Input
                  placeholder="Ej: Ferretería EPA, Mercado Libre"
                  autoComplete="off"
                  maxLength={100}
                  disabled={disabled}
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection
        icon={MapPin}
        title="Contacto"
        hint="Opcional. Cómo ubicar o comunicarse con el comercio."
      >
        <div className="space-y-4">
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Teléfono</FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: +584247000001"
                    autoComplete="off"
                    inputMode="tel"
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Ubicación</FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: Av. Principal, local 3"
                    autoComplete="off"
                    maxLength={255}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormDescription className={hintClass}>
                  Dirección física o URL del sitio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </>
  );
}
