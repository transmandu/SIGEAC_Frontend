import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Employee } from "@/types";
import { ChangeRequestFormValues } from "./CreateChangeRequestForm";

interface StepPlanAndResourcesProps {
  form: UseFormReturn<ChangeRequestFormValues>;
  employees: Employee[];
  isLoadingEmployees: boolean;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — Dólar" },
  { value: "VES", label: "VES — Bolívar" },
  { value: "EUR", label: "EUR — Euro" },
];

const preventWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  (e.target as HTMLInputElement).blur();

export function StepPlanAndResources({ form, employees, isLoadingEmployees }: StepPlanAndResourcesProps) {
  const {
    fields: requiredItemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "required_items",
  });

  const {
    fields: financialFields,
    append: appendFinancial,
    remove: removeFinancial,
  } = useFieldArray({
    control: form.control,
    name: "financial_resources",
  });

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
    <div className="flex flex-col gap-6">
      {/* Cambios Planificados */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cambios Planificados
        </h3>
        <FormField
          control={form.control}
          name="planned_changes"
          render={({ field }) => (
            <FormItem>
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
      </div>

      {/* Items Requeridos */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Items Requeridos
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendItem({ item_description: "" })}
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {requiredItemFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`required_items.${index}.item_description`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Descripción del item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Recursos Financieros */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recursos Financieros
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendFinancial({
                description: "",
                estimated_value: 0,
                currency_unit: "USD",
              })
            }
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {financialFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_120px_140px_auto] gap-3 items-start"
          >
            <FormField
              control={form.control}
              name={`financial_resources.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del recurso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`financial_resources.${index}.estimated_value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Monto
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="font-mono text-sm h-8"
                      onWheel={preventWheel}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`financial_resources.${index}.currency_unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Moneda
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8 font-mono text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-5"
              onClick={() => removeFinancial(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Actividades de Implementación */}
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
