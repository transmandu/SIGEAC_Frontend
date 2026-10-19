"use client";

import { Contact, IdCard, Users } from "lucide-react";
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
import {
  AERONAUTICAL_DNI_TYPES,
  AUTHORIZING_LABELS,
  type AeronauticalClientFormValues,
} from "./clientSchema";
import { PhoneInput } from "@/components/ui/PhoneInput";

/**
 * Campos compartidos por el alta y la edición de un cliente de OMAC.
 *
 * Van en dos columnas para que el diálogo sea ancho y bajo: apilados en una
 * sola, los bloques obligaban a desplazarse dentro de un diálogo angosto.
 */
export function ClientFormFields({
  control,
  disabled,
}: {
  control: Control<AeronauticalClientFormValues>;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormSection compact icon={Users} title="Cliente">
        <div className="space-y-3">
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
          <FormField
            control={control}
            name="authorizing"
            render={({ field, fieldState }) => (
              <FormItem data-tour="clientes-crear-authorizing">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Tipo de cliente
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
                      <SelectValue placeholder="Propietario o Explotador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(AUTHORIZING_LABELS).map(
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

      <FormSection compact icon={Contact} title="Contacto">
        <div className="space-y-3">
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem data-tour="clientes-crear-phone">
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
              <FormItem data-tour="clientes-crear-email">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Correo electrónico
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
        icon={IdCard}
        title="Documento y ubicación"
        className="md:col-span-2"
      >
        <div className="grid gap-3 md:grid-cols-[6.5rem_1fr_2fr]">
          <FormField
            control={control}
            name="dni_type"
            render={({ field, fieldState }) => {
              // Un tipo heredado fuera de V/J/E se conserva para no borrarlo al editar.
              const options: string[] = [...AERONAUTICAL_DNI_TYPES];
              if (field.value && !options.includes(field.value)) {
                options.push(field.value);
              }

              return (
                <FormItem data-tour="clientes-crear-dni-type">
                  <FieldLabelRow>
                    <FormLabel className={labelClass}>Doc.</FormLabel>
                  </FieldLabelRow>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={selectTriggerClass}
                        aria-invalid={!!fieldState.error}
                      >
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
            render={({ field }) => (
              <FormItem data-tour="clientes-crear-dni">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Número de documento
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
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem data-tour="clientes-crear-address">
                <FieldLabelRow>
                  <FormLabel className={labelClass}>Dirección</FormLabel>
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
        </div>
      </FormSection>
    </div>
  );
}
