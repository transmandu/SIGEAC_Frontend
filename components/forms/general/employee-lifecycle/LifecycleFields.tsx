"use client";

import { useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import {
  type Control,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { CreateJobTitleForm } from "@/components/forms/general/CreateJobTitleForm";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import {
  hintClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelFieldLabel } from "@/components/forms/PanelSection";
import { DateField } from "@/components/misc/DateField";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { Dialog } from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { AssignmentOption } from "@/hooks/ajustes/empleados/useAssignmentOptions";
import { useCanManageCatalog } from "@/hooks/helpers/useCanManageCatalog";
import { REASON_MAX } from "@/lib/employee-lifecycle";

/** Lo que tienen en común los formularios que eligen cargo, departamento y sede. */
export interface AssignmentValues extends FieldValues {
  job_title_id: string;
  department_id: string;
  location_id: string;
}

interface AssignmentFieldsProps<T extends AssignmentValues> {
  control: Control<T>;
  disabled?: boolean;
  jobTitles: AssignmentOption[];
  departments: AssignmentOption[];
  locations: AssignmentOption[];
  loading?: { jobTitles?: boolean; departments?: boolean; locations?: boolean };
  /** Lo que tiene el empleado: se muestra como referencia bajo cada campo. */
  current?: { jobTitle?: string; department?: string; location?: string };
  /** Cómo se nombra esa referencia: "Actual" (quien trabaja) o "Último" (quien egresó). */
  referenceLabel?: string;
}

/**
 * Cargo, departamento y sede de un empleado: tres selectores con búsqueda, sin
 * contenedor propio para que cada formulario los acomode en su rejilla. Quien
 * administra el catálogo puede crear un cargo sin salir del formulario.
 */
export function AssignmentFields<T extends AssignmentValues>({
  control,
  disabled,
  jobTitles,
  departments,
  locations,
  loading,
  current,
  referenceLabel = "Actual",
}: AssignmentFieldsProps<T>) {
  const { setValue } = useFormContext<T>();
  const canCreateJobTitle = useCanManageCatalog("jobTitles");
  const [creatingJobTitle, setCreatingJobTitle] = useState(false);

  const combo = (
    name: "job_title_id" | "department_id" | "location_id",
    label: string,
    options: AssignmentOption[],
    searchPlaceholder: string,
    isLoading?: boolean,
    reference?: string,
    extra?: { createLabel: string; onCreate: () => void },
  ) => (
    <FormField
      control={control}
      name={name as Path<T>}
      render={({ field, fieldState }) => (
        <FormItem>
          <PanelFieldLabel preventClick>
            {label}
            <RequiredIndicator invalid={!!fieldState.error} />
          </PanelFieldLabel>
          <OptionCombobox
            value={(field.value as string) || ""}
            onChange={field.onChange}
            options={options}
            searchPlaceholder={searchPlaceholder}
            loading={isLoading}
            disabled={disabled}
            invalid={!!fieldState.error}
            createLabel={extra?.createLabel}
            onCreate={extra?.onCreate}
          />
          {reference && (
            <FormDescription className={hintClass}>
              {referenceLabel}: {reference}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <>
      {combo(
        "job_title_id",
        "Cargo",
        jobTitles,
        "Buscar cargo...",
        loading?.jobTitles,
        current?.jobTitle,
        canCreateJobTitle
          ? {
              createLabel: "Crear cargo",
              onCreate: () => setCreatingJobTitle(true),
            }
          : undefined,
      )}
      {combo(
        "department_id",
        "Departamento",
        departments,
        "Buscar departamento...",
        loading?.departments,
        current?.department,
      )}
      {combo(
        "location_id",
        "Sede",
        locations,
        "Buscar sede...",
        loading?.locations,
        current?.location,
      )}

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
                setValue(
                  "job_title_id" as Path<T>,
                  String(jobTitle.id) as never,
                  { shouldDirty: true, shouldValidate: true },
                )
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

/** Fecha de calendario de un movimiento laboral, con su rótulo y mensaje de error. */
export function LifecycleDateField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  min,
  max,
  disabled,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  hint?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
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
              min={min}
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

/** Motivo en texto libre, con su contador. */
export function LifecycleReasonField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
  disabled,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <PanelFieldLabel
            action={
              <span className="text-xs tabular-nums text-muted-foreground">
                {String(field.value ?? "").length}/{REASON_MAX}
              </span>
            }
          >
            {label}
            {required && <RequiredIndicator invalid={!!fieldState.error} />}
          </PanelFieldLabel>
          <FormControl>
            <Textarea
              rows={3}
              maxLength={REASON_MAX}
              placeholder={placeholder}
              disabled={disabled}
              className={textareaClass}
              {...field}
              value={(field.value as string) ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
