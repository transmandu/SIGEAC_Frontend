"use client";

import { startOfDay } from "date-fns";
import { Control, useWatch } from "react-hook-form";
import { z } from "zod";

import type {
  ComplianceKind,
  ComplianceStartFields as StartPayload,
} from "@/actions/mantenimiento/planificacion/cumplimientos/lifecycle";
import { DatePickerField } from "@/components/ui/DatePickerField";
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
import { Textarea } from "@/components/ui/textarea";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { COMPONENT_ACTION_LABELS } from "@/lib/componentControlLabels";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ComponentAction, MaintenanceCountingMethod } from "@/types";
import { format } from "date-fns";
import { NumericInput } from "./_shared";
import {
  SearchableSelect,
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
} from "./_theme";
import { WorkOrderField } from "./WorkOrderField";

export const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === undefined || value === null ? undefined : value,
  z.coerce.number().min(0, "Debe ser ≥ 0").optional(),
);

/** Qué lecturas pide un ítem: las de las unidades que usa (los días no se leen). */
export const readingsFor = (units: MaintenanceCountingMethod[]) => ({
  hours: units.includes("HOURS"),
  cycles: units.includes("CYCLES"),
});

export const buildStartSchema = (units: MaintenanceCountingMethod[]) =>
  z
    .object({
      applied_date: z
        .date({ error: "Seleccione una fecha" })
        .refine((date) => startOfDay(date) <= startOfDay(new Date()), {
          message: "No puede iniciarse con fecha futura",
        }),
      applied_hours: optionalNumber,
      applied_cycles: optionalNumber,
      maintenance_provider_id: z.string().min(1, "Seleccione quién lo realiza"),
      work_order_id: z.string().optional(),
      notes: z.string().optional(),
      action: z.string().optional(),
      consumed_hours: optionalNumber,
      consumed_cycles: optionalNumber,
      compliance_method: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const { hours, cycles } = readingsFor(units);

      if (hours && values.applied_hours === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Indique las horas al iniciar",
          path: ["applied_hours"],
        });
      }

      if (cycles && values.applied_cycles === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Indique los ciclos al iniciar",
          path: ["applied_cycles"],
        });
      }
    });

export type StartFormValues = z.infer<ReturnType<typeof buildStartSchema>>;

export const startDefaults = (defaults: {
  date?: Date;
  hours?: number | null;
  cycles?: number | null;
  providerId?: number | string | null;
  action?: ComponentAction;
  method?: string | null;
}): StartFormValues => ({
  applied_date: defaults.date ?? new Date(),
  applied_hours: defaults.hours ?? undefined,
  applied_cycles: defaults.cycles ?? undefined,
  maintenance_provider_id: defaults.providerId ? String(defaults.providerId) : "",
  work_order_id: "",
  notes: "",
  action: defaults.action,
  consumed_hours: 0,
  consumed_cycles: 0,
  compliance_method: defaults.method ?? "",
});

export const toStartPayload = (
  kind: ComplianceKind,
  values: StartFormValues,
): StartPayload => {
  const payload: StartPayload = {
    maintenance_provider_id: values.maintenance_provider_id,
    applied_date: format(values.applied_date, "yyyy-MM-dd"),
    applied_hours: values.applied_hours ?? null,
    applied_cycles: values.applied_cycles ?? null,
    work_order_id: values.work_order_id || undefined,
    notes: values.notes || undefined,
  };

  if (kind === "component") {
    const resets = values.action === "OVERHAUL";
    payload.action = values.action as ComponentAction;
    payload.consumed_hours = resets ? 0 : (values.consumed_hours ?? 0);
    payload.consumed_cycles = resets ? 0 : (values.consumed_cycles ?? 0);
  }

  if (kind === "directive") {
    payload.compliance_method = values.compliance_method || undefined;
  }

  return payload;
};

interface ComplianceStartFieldsProps {
  control: Control<any>;
  kind: ComplianceKind;
  units: MaintenanceCountingMethod[];
  aircraftId: number | string;
  /** Qué atiende la orden: alimenta el diálogo de creación de OT. */
  subject: string;
  taskDescription: string;
  /** Texto de la fecha: "inicio" del cumplimiento. */
  dateLabel?: string;
}

/**
 * Los datos con que arranca un período de cumplimiento, iguales en los cuatro
 * controles más lo propio de cada uno (trabajo y consumido en componentes,
 * método en directivas). Los usa tanto "Iniciar cumplimiento" como el segundo
 * paso de "Cerrar cumplimiento".
 */
export function ComplianceStartFields({
  control,
  kind,
  units,
  aircraftId,
  subject,
  taskDescription,
  dateLabel = "Fecha de inicio",
}: ComplianceStartFieldsProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: providers, isLoading: isLoadingProviders } =
    useGetMaintenanceProviders(selectedCompany?.slug);
  const action = useWatch({ control, name: "action" });
  const { hours, cycles } = readingsFor(units);
  // Solo el overhaul devuelve el componente a cero; lo demás conserva lo consumido.
  const keepsConsumed = action !== "OVERHAUL";

  return (
    <>
      <FormField
        control={control}
        name="applied_date"
        render={({ field }) => (
          <FormItem className="w-full">
            <DatePickerField
              label={dateLabel}
              value={field.value}
              setValue={(date) => field.onChange(date ?? undefined)}
              maxDate={new Date()}
              required
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {(hours || cycles) && (
        <div className="grid grid-cols-2 gap-4">
          {hours && (
            <FormField
              control={control}
              name="applied_hours"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>
                    Horas al iniciar
                  </FormLabel>
                  <FormControl>
                    <NumericInput
                      className={fieldClass}
                      placeholder="0"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {cycles && (
            <FormField
              control={control}
              name="applied_cycles"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>
                    Ciclos al iniciar
                  </FormLabel>
                  <FormControl>
                    <NumericInput
                      className={fieldClass}
                      placeholder="0"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      <FormField
        control={control}
        name="maintenance_provider_id"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className={labelClass}>Realizado Por</FormLabel>
            <SearchableSelect
              options={providers ?? []}
              value={field.value}
              loading={isLoadingProviders}
              placeholder="Seleccione..."
              searchPlaceholder="Buscar entidad..."
              emptyLabel="No se encontró ninguna entidad."
              onSelect={(provider) => field.onChange(String(provider.id))}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {kind === "component" && (
        <>
          <FormField
            control={control}
            name="action"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className={labelClass}>Trabajo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(COMPONENT_ACTION_LABELS).map(
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

          {keepsConsumed && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="consumed_hours"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>
                      Horas que conserva
                    </FormLabel>
                    <FormControl>
                      <NumericInput
                        className={fieldClass}
                        placeholder="0"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormDescription className={hintClass}>
                      Desde su último overhaul; una reparación no lo pone en
                      cero.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="consumed_cycles"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>
                      Ciclos que conserva
                    </FormLabel>
                    <FormControl>
                      <NumericInput
                        className={fieldClass}
                        placeholder="0"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </>
      )}

      {kind === "directive" && (
        <FormField
          control={control}
          name="compliance_method"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className={labelClass}>
                Método de cumplimiento{" "}
                <span className="text-xs text-muted-foreground">
                  (Opcional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Inspección visual según párrafo (e)"
                  className={fieldClass}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="work_order_id"
        render={({ field }) => (
          <WorkOrderField
            value={field.value}
            onChange={field.onChange}
            aircraftId={aircraftId}
            subject={subject}
            taskDescription={taskDescription}
            hint="Opcional ahora, pero el cumplimiento no puede cerrarse sin una Orden de Trabajo."
          />
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className={labelClass}>
              Observaciones{" "}
              <span className="text-xs text-muted-foreground">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="..."
                className={cn(fieldClass, "h-auto resize-none py-2")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
