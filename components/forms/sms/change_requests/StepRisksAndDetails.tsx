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

interface StepRisksAndDetailsProps {
  form: UseFormReturn<ChangeRequestFormValues>;
  employees: Employee[];
  isLoadingEmployees: boolean;
}

const SEVERITY_OPTIONS = [
  { value: "A", label: "A — Catastrófico" },
  { value: "B", label: "B — Peligroso" },
  { value: "C", label: "C — Mayor" },
  { value: "D", label: "D — Menor" },
  { value: "E", label: "E — Insignificante" },
];

const PROBABILITY_OPTIONS = [
  { value: "1", label: "1 — Extremadamente Improbable" },
  { value: "2", label: "2 — Improbable" },
  { value: "3", label: "3 — Remoto" },
  { value: "4", label: "4 — Ocasional" },
  { value: "5", label: "5 — Frecuente" },
];

const TIME_UNIT_OPTIONS = [
  { value: "days", label: "Días" },
  { value: "weeks", label: "Semanas" },
  { value: "months", label: "Meses" },
  { value: "years", label: "Años" },
];

const preventWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  (e.target as HTMLInputElement).blur();

export function StepRisksAndDetails({ form, employees, isLoadingEmployees }: StepRisksAndDetailsProps) {
  const {
    fields: riskFields,
    append: appendRisk,
    remove: removeRisk,
  } = useFieldArray({
    control: form.control,
    name: "risk_assessments",
  });

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`,
    badge: e.dni,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Evaluación de Riesgos */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Evaluación de Riesgos
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendRisk({
                hazard_description: "",
                probability_value: 1,
                severity_value: "E",
              })
            }
          >
            <Plus className="size-3 mr-1" />
            Agregar
          </Button>
        </div>
        {riskFields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_180px_180px_auto] gap-3 items-start px-3 py-3 border border-border/30 rounded-md"
          >
            <FormField
              control={form.control}
              name={`risk_assessments.${index}.hazard_description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Peligro
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del peligro"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`risk_assessments.${index}.probability_value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Probabilidad
                  </FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8 font-mono text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROBABILITY_OPTIONS.map((opt) => (
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
            <FormField
              control={form.control}
              name={`risk_assessments.${index}.severity_value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Severidad
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8 font-mono text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((opt) => (
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
              onClick={() => removeRisk(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Plan de Mitigación */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Plan de Mitigación
        </h3>
        <FormField
          control={form.control}
          name="mitigation_plan"
          render={({ field }) => (
            <FormItem>
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
      </div>

      {/* Fechas y Períodos */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Fechas y Períodos
        </h3>
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

          {/* Período de Estabilización */}
          <FormItem>
            <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Período de Estabilización
            </FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="stabilization_period_value"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Valor"
                      className="font-mono text-sm"
                      onWheel={preventWheel}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name="stabilization_period_unit"
                render={({ field }) => (
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                )}
              />
            </div>
            <FormMessage />
          </FormItem>
        </div>
      </div>

      {/* Líder del Proyecto */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Responsables
        </h3>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
}
