"use client";

import { useState } from "react";
import { Briefcase, BriefcaseBusiness, Contact, UserRound } from "lucide-react";
import { Control, useFormContext, useWatch } from "react-hook-form";

import {
  fieldClass,
  hintClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { CreateJobTitleForm } from "@/components/forms/general/CreateJobTitleForm";
import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DateField } from "@/components/misc/DateField";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCanManageCatalog } from "@/hooks/helpers/useCanManageCatalog";
import { PhoneInput } from "@/components/ui/PhoneInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toCalendarPayload } from "@/lib/date";
import { cn } from "@/lib/utils";
import { EmployeePhotoField } from "./EmployeePhotoField";
import { OptionCombobox } from "./OptionCombobox";
import {
  BLOOD_TYPES,
  DNI_TYPES,
  type EmployeeFormValues,
} from "./employeeSchema";

export interface Option {
  id: string;
  label: string;
}

interface Props {
  /** El del formulario de alta trae más campos; aquí solo se usan los comunes. */
  control: Control<EmployeeFormValues>;
  disabled?: boolean;
  /** En la edición la cédula no se cambia: identifica a la persona en todo el sistema. */
  isEditing?: boolean;
  /** Foto guardada del empleado (edición). */
  existingPhotoUrl?: string | null;
  jobTitles: Option[];
  departments: Option[];
  locations: Option[];
  loading?: { jobTitles?: boolean; departments?: boolean; locations?: boolean };
}

const initialsOf = (first?: string, last?: string) =>
  `${first?.trim()?.[0] ?? ""}${last?.trim()?.[0] ?? ""}`.toUpperCase();

/** Un select con rótulo, indicador de obligatorio y mensaje de error. */
function SelectRow({
  control,
  name,
  label,
  placeholder,
  options,
  disabled,
  required,
  hint,
}: {
  control: Control<EmployeeFormValues>;
  name: keyof EmployeeFormValues & string;
  label: string;
  placeholder: string;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <FormField
      control={control}
      name={name as "gender"}
      render={({ field, fieldState }) => (
        <FormItem>
          <PanelFieldLabel preventClick>
            {label}
            {required && <RequiredIndicator invalid={!!fieldState.error} />}
          </PanelFieldLabel>
          <Select
            value={(field.value as string) || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={cn(selectTriggerClass, "w-full")}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hint && (
            <FormDescription className={hintClass}>{hint}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Selector con búsqueda de un registro de otra tabla, con su rótulo y mensaje de error. */
function ComboRow({
  control,
  name,
  label,
  options,
  searchPlaceholder,
  loading,
  disabled,
  required,
  createLabel,
  onCreate,
}: {
  control: Control<EmployeeFormValues>;
  name: keyof EmployeeFormValues & string;
  label: string;
  options: Option[];
  searchPlaceholder: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  createLabel?: string;
  onCreate?: () => void;
}) {
  return (
    <FormField
      control={control}
      name={name as "job_title_id"}
      render={({ field, fieldState }) => (
        <FormItem>
          <PanelFieldLabel preventClick>
            {label}
            {required && <RequiredIndicator invalid={!!fieldState.error} />}
          </PanelFieldLabel>
          <OptionCombobox
            value={(field.value as string) || ""}
            onChange={field.onChange}
            options={options}
            searchPlaceholder={searchPlaceholder}
            loading={loading}
            disabled={disabled}
            invalid={!!fieldState.error}
            createLabel={createLabel}
            onCreate={onCreate}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Fecha de calendario con rótulo y mensaje de error. */
function DateRow({
  control,
  name,
  label,
  disabled,
  max,
  hint,
}: {
  control: Control<EmployeeFormValues>;
  name: keyof EmployeeFormValues & string;
  label: string;
  disabled?: boolean;
  max?: string;
  hint?: string;
}) {
  return (
    <FormField
      control={control}
      name={name as "birth_date"}
      render={({ field }) => (
        <FormItem>
          <PanelFieldLabel preventClick>{label}</PanelFieldLabel>
          <FormControl>
            <DateField
              ref={field.ref}
              name={field.name}
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              max={max}
              disabled={disabled}
            />
          </FormControl>
          {hint && (
            <FormDescription className={hintClass}>{hint}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Un campo de texto con rótulo, indicador de obligatorio y mensaje de error. */
function TextRow({
  control,
  name,
  label,
  placeholder,
  required,
  disabled,
  type = "text",
  hint,
  className,
  inputClassName,
  maxLength = 255,
  autoComplete = "off",
}: {
  control: Control<EmployeeFormValues>;
  name: keyof EmployeeFormValues & string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <FormField
      control={control}
      name={name as "first_name"}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <PanelFieldLabel>
            {label}
            {required && <RequiredIndicator invalid={!!fieldState.error} />}
          </PanelFieldLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              maxLength={maxLength}
              disabled={disabled}
              className={cn(fieldClass, inputClassName)}
              {...field}
              value={(field.value as string) ?? ""}
            />
          </FormControl>
          {hint && (
            <FormDescription className={hintClass}>{hint}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Los tres bloques de datos del empleado —personales, contacto y trabajo—,
 * iguales en el alta y en la edición.
 */
export function EmployeeFormFields({
  control,
  disabled,
  isEditing,
  existingPhotoUrl,
  jobTitles,
  departments,
  locations,
  loading,
}: Props) {
  const firstName = useWatch({ control, name: "first_name" });
  const lastName = useWatch({ control, name: "last_name" });
  const removePhoto = useWatch({ control, name: "remove_photo" });
  const { setValue } = useFormContext<EmployeeFormValues>();
  const todayIso = toCalendarPayload(new Date()) ?? "";
  const canCreateJobTitle = useCanManageCatalog("jobTitles");
  const [creatingJobTitle, setCreatingJobTitle] = useState(false);

  return (
    <>
      <PanelSection
        icon={UserRound}
        title="Datos personales"
        hint="Como figura la persona en sus documentos."
      >
        <div className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-6">
          <FormField
            control={control}
            name="profile_photo"
            render={({ field }) => (
              <FormItem className="flex justify-center md:block">
                <EmployeePhotoField
                  file={field.value}
                  onFileChange={field.onChange}
                  existingUrl={existingPhotoUrl}
                  removed={removePhoto}
                  onRemovedChange={(removed) =>
                    setValue("remove_photo", removed, { shouldDirty: true })
                  }
                  initials={initialsOf(firstName, lastName)}
                  disabled={disabled}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <TextRow
              control={control}
              name="first_name"
              label="Nombre"
              placeholder="Ej: Juan"
              required
              disabled={disabled}
            />
            <TextRow
              control={control}
              name="middle_name"
              label="Segundo nombre"
              placeholder="Ej: David"
              disabled={disabled}
            />
            <TextRow
              control={control}
              name="last_name"
              label="Apellido"
              placeholder="Ej: Pérez"
              required
              disabled={disabled}
            />
            <TextRow
              control={control}
              name="second_last_name"
              label="Segundo apellido"
              placeholder="Ej: Alfonso"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-[5.5rem_1fr] gap-2">
            <FormField
              control={control}
              name="dni_type"
              render={({ field }) => (
                <FormItem>
                  <PanelFieldLabel preventClick>Doc.</PanelFieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(selectTriggerClass, "w-full")}
                      >
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DNI_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <TextRow
              control={control}
              name="dni"
              label="Cédula"
              placeholder="Ej: 12345678"
              required
              disabled={disabled || isEditing}
              maxLength={20}
              inputClassName="tabular-nums"
              hint={isEditing ? "No se puede cambiar." : undefined}
            />
          </div>

          <DateRow
            control={control}
            name="birth_date"
            label="Fecha de nacimiento"
            max={todayIso}
            disabled={disabled}
          />

          <SelectRow
            control={control}
            name="gender"
            label="Género"
            placeholder="Seleccione..."
            required
            disabled={disabled}
            options={[
              { id: "MALE", label: "Hombre" },
              { id: "FEMALE", label: "Mujer" },
            ]}
          />

          <FormField
            control={control}
            name="blood_type"
            render={({ field }) => (
              <FormItem>
                <PanelFieldLabel preventClick>Tipo de sangre</PanelFieldLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className={cn(selectTriggerClass, "w-full")}>
                      <SelectValue placeholder="Sin indicar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin indicar</SelectItem>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
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
        hint="Cómo comunicarse con la persona. Es opcional."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextRow
            control={control}
            name="email"
            label="Correo personal"
            type="email"
            placeholder="Ej: correo@ejemplo.com"
            disabled={disabled}
            autoComplete="email"
          />

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

          <TextRow
            control={control}
            name="address"
            label="Dirección"
            placeholder="Ej: Av. Principal, Edificio X, Piso Y"
            disabled={disabled}
            className="sm:col-span-2"
            autoComplete="street-address"
          />
        </div>
      </PanelSection>

      <PanelSection
        icon={Briefcase}
        title="Trabajo"
        hint="Dónde y en qué cargo se desempeña en la empresa."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ComboRow
            control={control}
            name="job_title_id"
            label="Cargo"
            options={jobTitles}
            searchPlaceholder="Buscar cargo..."
            loading={loading?.jobTitles}
            disabled={disabled}
            required
            createLabel="Crear cargo"
            onCreate={
              canCreateJobTitle ? () => setCreatingJobTitle(true) : undefined
            }
          />
          <ComboRow
            control={control}
            name="department_id"
            label="Departamento"
            options={departments}
            searchPlaceholder="Buscar departamento..."
            loading={loading?.departments}
            disabled={disabled}
            required
          />
          <ComboRow
            control={control}
            name="location_id"
            label="Ubicación"
            options={locations}
            searchPlaceholder="Buscar ubicación..."
            loading={loading?.locations}
            disabled={disabled}
            required
          />
          <DateRow
            control={control}
            name="start_date"
            label="Fecha de ingreso"
            disabled={disabled}
            hint={isEditing ? undefined : "Si se deja vacía, será hoy."}
          />
        </div>
      </PanelSection>

      {canCreateJobTitle && (
        <Dialog open={creatingJobTitle} onOpenChange={setCreatingJobTitle}>
          <FormDialogContent
            icon={BriefcaseBusiness}
            title="Crear Cargo"
            description="Registre el cargo; quedará elegido para este empleado."
            className="sm:max-w-105"
          >
            <CreateJobTitleForm
              onCreated={(jobTitle) =>
                setValue("job_title_id", String(jobTitle.id), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onSuccess={() => setCreatingJobTitle(false)}
              onCancel={() => setCreatingJobTitle(false)}
            />
          </FormDialogContent>
        </Dialog>
      )}
    </>
  );
}
