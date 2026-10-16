"use client";

import { Contact, Handshake } from "lucide-react";
import { Control } from "react-hook-form";

import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VENDOR_TYPE_LABELS, type VendorFormValues } from "./vendorSchema";

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
      <FormSection
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
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Nombre
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
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
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Tipo
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
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
      </FormSection>

      <FormSection
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
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Teléfono
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ej: +584247000001"
                    autoComplete="off"
                    inputMode="tel"
                    maxLength={20}
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
            name="email"
            render={({ field, fieldState }) => (
              <FormItem data-tour="proveedores-dialog-email">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Correo electrónico
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
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
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Dirección</FormLabel>
                </FieldLabelRow>
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
                  Opcional. Dirección fiscal para facturación y
                  correspondencia.
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
