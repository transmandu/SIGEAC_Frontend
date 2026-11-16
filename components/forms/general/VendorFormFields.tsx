"use client";

import { Contact, Handshake } from "lucide-react";
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
import { VENDOR_TYPE_LABELS, type VendorFormValues } from "./vendorSchema";
import { PhoneInput } from "@/components/ui/PhoneInput";

/** Campos compartidos por el alta y la edición de un proveedor. */
export function VendorFormFields({
  control,
  disabled,
}: {
  control: Control<VendorFormValues>;
  disabled?: boolean;
}) {
  return (
    <>
      <PanelSection
        icon={Handshake}
        title="Identificación"
        hint="Quién es y para qué se usa en las compras."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem data-tour="proveedores-dialog-name">
                <PanelFieldLabel>
                  Nombre
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Boeing, Airbus"
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
            render={({ field, fieldState }) => (
              <FormItem data-tour="proveedores-dialog-type">
                <PanelFieldLabel>
                  Tipo
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccione el tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(VENDOR_TYPE_LABELS).map(
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
        </div>
      </PanelSection>

      <PanelSection
        icon={Contact}
        title="Contacto"
        hint="Cómo comunicarse y dónde ubicarlo."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormItem data-tour="proveedores-dialog-phone">
                <PanelFieldLabel>
                  Teléfono
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
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
            name="email"
            render={({ field, fieldState }) => (
              <FormItem data-tour="proveedores-dialog-email">
                <PanelFieldLabel>
                  Correo electrónico
                  <RequiredIndicator invalid={!!fieldState.error} />
                </PanelFieldLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Ej: contacto@proveedor.com"
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
            name="address"
            render={({ field }) => (
              <FormItem
                className="sm:col-span-2"
                data-tour="proveedores-dialog-address"
              >
                <PanelFieldLabel>Dirección</PanelFieldLabel>
                <FormControl>
                  <Input
                    placeholder="Ubicación fiscal"
                    autoComplete="off"
                    maxLength={100}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormDescription className={hintClass}>
                  Opcional. Dirección fiscal para facturación y correspondencia.
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
