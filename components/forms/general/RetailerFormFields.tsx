"use client";

import { MapPin, Store } from "lucide-react";
import { Control } from "react-hook-form";

import {
  fieldClass,
  hintClass,
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
import type { RetailerFormValues } from "./retailerSchema";
import { PhoneInput } from "@/components/ui/PhoneInput";

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
      <PanelSection
        icon={Store}
        title="Identificación"
        hint="Tienda física o sitio en línea donde se compra."
      >
        <FormField
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <PanelFieldLabel>
                Nombre del comercio
                <RequiredIndicator invalid={!!fieldState.error} />
              </PanelFieldLabel>
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
      </PanelSection>

      <PanelSection
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
                <PanelFieldLabel>Teléfono</PanelFieldLabel>
                <FormControl>
                  <PhoneInput
                    disabled={disabled}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
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
                <PanelFieldLabel>Ubicación</PanelFieldLabel>
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
      </PanelSection>
    </>
  );
}
