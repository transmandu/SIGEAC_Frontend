"use client";

import { Contact, IdCard, MapPin } from "lucide-react";
import { Control } from "react-hook-form";

import {
  FieldLabelRow,
  FormSection,
  fieldClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { NumericTextInput } from "@/components/forms/mantenimiento/almacen/_components/NumericInput";
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
import { AIRLINE_DNI_TYPES, type AirlineClientFormValues } from "./clientSchema";

/**
 * Campos compartidos por el alta y la edición de un cliente de aerolínea.
 *
 * Van en dos columnas para que el diálogo sea ancho y bajo: apilados en una
 * sola, los cinco bloques obligaban a desplazarse dentro de un diálogo angosto.
 */
export function ClientFormFields({
  control,
  disabled,
}: {
  control: Control<AirlineClientFormValues>;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormSection compact icon={IdCard} title="Identificación">
        <div className="space-y-3">
          <div className="grid grid-cols-[6.5rem_1fr] gap-3">
            <FormField
              control={control}
              name="dni_type"
              render={({ field, fieldState }) => {
                // Un tipo heredado fuera de V/J/E se conserva para no borrarlo al editar.
                const options: string[] = [...AIRLINE_DNI_TYPES];
                if (field.value && !options.includes(field.value)) {
                  options.push(field.value);
                }

                return (
                  <FormItem data-tour="clientes-crear-dni-type">
                    <FieldLabelRow>
                      <FormLabel className={labelClass}>
                        Doc.
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
                          <SelectValue placeholder="V/J/E" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="dni"
              render={({ field, fieldState }) => (
                <FormItem data-tour="clientes-crear-dni">
                  <FieldLabelRow>
                    <FormLabel className={labelClass}>
                      Número de documento
                      <RequiredIndicator invalid={!!fieldState.error} />
                    </FormLabel>
                  </FieldLabelRow>
                  <FormControl>
                    <NumericTextInput
                      integerOnly
                      placeholder="Ej: 12345678"
                      autoComplete="off"
                      maxLength={11}
                      disabled={disabled}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value}
                      onValueChange={field.onChange}
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
            render={({ field, fieldState }) => (
              <FormItem data-tour="clientes-crear-name">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Nombre o razón social
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ingresa el nombre"
                    autoComplete="off"
                    maxLength={40}
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
        <div className="space-y-3">
          <FormField
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormItem data-tour="clientes-crear-phone">
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
                    maxLength={15}
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
              <FormItem data-tour="clientes-crear-email">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Correo electrónico
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
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

      <FormSection
        compact
        icon={MapPin}
        title="Ubicación y crédito"
        className="md:col-span-2"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_11rem]">
          <FormField
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem data-tour="clientes-crear-address">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Dirección
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <Input
                    placeholder="Ingresa la dirección"
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
          <FormField
            control={control}
            name="pay_credit_days"
            render={({ field, fieldState }) => (
              <FormItem data-tour="clientes-crear-credit">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Días de crédito
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <FormControl>
                  <NumericTextInput
                    integerOnly
                    placeholder="0 - 730"
                    autoComplete="off"
                    maxLength={3}
                    disabled={disabled}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onValueChange={field.onChange}
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
