"use client";

import { Contact, Truck } from "lucide-react";
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
      <PanelSection compact icon={Truck} title="Identificación">
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_10rem_11rem]">
            <FormField
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem data-tour="agencias-envio-crear-name">
                  <PanelFieldLabel>
                    Nombre
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
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
                  <PanelFieldLabel>
                    Código
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
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
                <PanelFieldLabel>Descripción</PanelFieldLabel>
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
      </PanelSection>

      <PanelSection compact icon={Contact} title="Contacto">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem data-tour="agencias-envio-crear-phone">
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
            name="email"
            render={({ field }) => (
              <FormItem data-tour="agencias-envio-crear-email">
                <PanelFieldLabel>Correo electrónico</PanelFieldLabel>
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
      </PanelSection>
    </div>
  );
}
