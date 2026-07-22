import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { StoreChangeRequestPayload, Employee } from "@/types";

interface StepPlanProps {
  form: UseFormReturn<StoreChangeRequestPayload>;
  employees: Employee[];
  isLoadingEmployees: boolean;
}

export function StepPlan({ form, employees, isLoadingEmployees }: StepPlanProps) {
  const {
    fields: activityFields,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({
    control: form.control,
    name: "activities",
  });

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`,
    badge: e.dni,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="estimated_change_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fecha Estimada del Cambio
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isLoadingEmployees ? (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Líder del Proyecto
            </FormLabel>
            <div className="flex items-center gap-2 h-9 px-3 border border-border/60 rounded-md">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cargando...</span>
            </div>
          </FormItem>
        ) : (
          <ComboboxField
            form={form}
            name="project_lead_by"
            label="Líder del Proyecto"
            placeholder="Seleccionar líder"
            searchPlaceholder="Buscar por nombre o DNI..."
            emptyText="No se encontraron empleados"
            options={employeeOptions}
          />
        )}

        <FormField
          control={form.control}
          name="cutoff_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fecha de Corte
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stabilization_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Período de Estabilización
              </FormLabel>
              <FormControl>
                <Input placeholder="Ej: 30 días" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="mitigation_plan"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Plan de Mitigación
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa el plan de mitigación..."
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="planned_changes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cambios Planificados
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa los cambios planificados..."
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Actividades */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Actividades de Implementación
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendActivity({
                activity_description: "",
                assigned_employee_id: 0,
              })
            }
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {activityFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_240px_auto] gap-3 items-start"
          >
            <FormField
              control={form.control}
              name={`activities.${index}.activity_description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la actividad"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoadingEmployees ? (
              <FormItem>
                <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Responsable
                </FormLabel>
                <div className="flex items-center gap-2 h-8 px-3 border border-border/60 rounded-md">
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cargando...</span>
                </div>
              </FormItem>
            ) : (
              <ComboboxField
                form={form}
                name={`activities.${index}.assigned_employee_id`}
                label="Responsable"
                placeholder="Asignar"
                searchPlaceholder="Buscar..."
                emptyText="No se encontraron empleados"
                options={employeeOptions}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-5"
              onClick={() => removeActivity(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
