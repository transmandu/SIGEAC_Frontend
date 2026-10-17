"use client";

import { Contact, Truck } from "lucide-react";
import { Control } from "react-hook-form";

import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
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
import {
  SHIPPING_AGENCY_TYPE_LABELS,
  type ShippingAgencyFormValues,
} from "./shippingAgencySchema";
import { PhoneInput } from "@/components/ui/PhoneInput";

/** Campos compartidos por el alta y la edición de una agencia de envío. */
export function ShippingAgencyFormFields({
  control,
  disabled,
}: {
  control: Control<ShippingAgencyFormValues>;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormSection compact icon={Truck} title="Identificación">
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_10rem_11rem]">
            <FormField
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem data-tour="agencias-envio-crear-name">
                  <FieldLabelRow>
                    <FormLabel className={labelClass}>
                      Nombre
                      <RequiredIndicator invalid={!!fieldState.error} />
                    </FormLabel>
                  </FieldLabelRow>
                  <FormControl>
                    <Input
                      placeholder="Ej: DHL Express"
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
              name="code"
              render={({ field, fieldState }) => (
                <FormItem data-tour="agencias-envio-crear-code">
                  <FieldLabelRow>
                    <FormLabel className={labelClass}>
                      Código
                      <RequiredIndicator invalid={!!fieldState.error} />
                    </FormLabel>
                  </FieldLabelRow>
                  <FormControl>
                    <Input
                      placeholder="Ej: DHL001"
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
                <FormItem data-tour="agencias-envio-crear-type">
                  <FieldLabelRow>
                    <FormLabel className={labelClass}>
                      Tipo
                      <RequiredIndicator invalid={!!fieldState.error} />
                    </FormLabel>
                  </FieldLabelRow>
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
                      {Object.entries(SHIPPING_AGENCY_TYPE_LABELS).map(
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
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem data-tour="agencias-envio-crear-description">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Descripción</FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Describe brevemente la agencia"
                    autoComplete="off"
                    maxLength={1000}
                    disabled={disabled}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection compact icon={Contact} title="Contacto">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem data-tour="agencias-envio-crear-phone">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Teléfono</FormLabel>
                </FieldLabelRow>
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
            render={({ field }) => (
              <FormItem data-tour="agencias-envio-crear-email">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Correo electrónico
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Ej: contacto@agencia.com"
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
        </div>
      </FormSection>
    </div>
  );
}
