"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { ComboboxField } from "@/components/ui/ComboboxField";
import {
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
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import type { Employee } from "@/types";
import type { ExternalEmployee } from "@/hooks/ajustes/convenios/types";

export type DrillPersonMode = "INTERNO" | "AUTORIZADO" | "EXTERNO";

/** Valor que el formulario maneja para una persona flexible. */
export interface DrillPersonFormValue {
  mode: DrillPersonMode;
  employee_id?: string;
  authorized_employee_id?: string;
  name?: string;
}

export const emptyDrillPerson = (): DrillPersonFormValue => ({
  mode: "INTERNO",
  employee_id: "",
  authorized_employee_id: "",
  name: "",
});

interface PersonSelectProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  /** Ruta base del objeto persona, p. ej. "coordinator" o "evaluators.0". */
  basePath: string;
  label: string;
  employees: Employee[];
  authorizedEmployees: ExternalEmployee[];
  required?: boolean;
}

/**
 * Selector de persona reutilizable: empleado interno, empleado autorizado de
 * otra empresa o persona externa escrita a mano. Se usa para coordinador,
 * evaluadores y responsables de acciones.
 */
export function PersonSelect<T extends FieldValues>({
  form,
  basePath,
  label,
  employees,
  authorizedEmployees,
  required = true,
}: PersonSelectProps<T>) {
  const mode = useWatch({
    control: form.control,
    name: `${basePath}.mode` as Path<T>,
  }) as DrillPersonMode | undefined;

  const employeeOptions = employees.map((employee) => ({
    value: String(employee.id),
    label: `${employee.first_name} ${employee.last_name}`.trim(),
  }));

  const authorizedOptions = authorizedEmployees.map((employee) => ({
    value: String(employee.id),
    label: employee.employee_name || employee.dni_employee,
    badge: employee.from_company_db,
  }));

  const clearOthers = (nextMode: DrillPersonMode) => {
    if (nextMode !== "INTERNO") {
      form.setValue(`${basePath}.employee_id` as Path<T>, "" as never);
    }
    if (nextMode !== "AUTORIZADO") {
      form.setValue(
        `${basePath}.authorized_employee_id` as Path<T>,
        "" as never,
      );
    }
    if (nextMode !== "EXTERNO") {
      form.setValue(`${basePath}.name` as Path<T>, "" as never);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-border/40 bg-muted/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <FormField
        control={form.control}
        name={`${basePath}.mode` as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Origen</FormLabel>
            <Select
              value={(field.value as string) || "INTERNO"}
              onValueChange={(value) => {
                field.onChange(value);
                clearOthers(value as DrillPersonMode);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNO">Empleado de la empresa</SelectItem>
                <SelectItem value="AUTORIZADO">
                  Empleado autorizado de otra empresa
                </SelectItem>
                <SelectItem value="EXTERNO">Persona externa</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {mode === "AUTORIZADO" ? (
        <ComboboxField
          form={form}
          name={`${basePath}.authorized_employee_id` as Path<T>}
          label="Empleado autorizado"
          placeholder="Seleccionar empleado autorizado"
          searchPlaceholder="Buscar por nombre o cédula..."
          emptyText="No hay empleados autorizados para actividades SMS."
          options={authorizedOptions}
          required={required}
        />
      ) : mode === "EXTERNO" ? (
        <FormField
          control={form.control}
          name={`${basePath}.name` as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-0.5 text-xs">
                Nombre de la persona
                <RequiredIndicator show={required} />
              </FormLabel>
              <Input
                {...field}
                value={(field.value as string) ?? ""}
                placeholder="Escriba el nombre completo"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <ComboboxField
          form={form}
          name={`${basePath}.employee_id` as Path<T>}
          label="Empleado"
          placeholder="Seleccionar empleado"
          searchPlaceholder="Buscar empleado..."
          options={employeeOptions}
          required={required}
        />
      )}
    </div>
  );
}

/** Convierte el valor del formulario al payload plano del backend. */
export function toPersonPayload(person: DrillPersonFormValue | undefined) {
  if (!person) {
    return { employee_id: null, authorized_employee_id: null, name: null };
  }

  if (person.mode === "AUTORIZADO") {
    return {
      employee_id: null,
      authorized_employee_id: person.authorized_employee_id
        ? Number(person.authorized_employee_id)
        : null,
      name: null,
    };
  }

  if (person.mode === "EXTERNO") {
    return {
      employee_id: null,
      authorized_employee_id: null,
      name: person.name?.trim() || null,
    };
  }

  return {
    employee_id: person.employee_id ? Number(person.employee_id) : null,
    authorized_employee_id: null,
    name: null,
  };
}

export const hasDrillPerson = (
  person: DrillPersonFormValue | undefined,
): boolean => {
  if (!person) return false;
  if (person.mode === "AUTORIZADO") return !!person.authorized_employee_id;
  if (person.mode === "EXTERNO") return !!person.name?.trim();

  return !!person.employee_id;
};
