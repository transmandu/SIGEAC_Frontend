import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Employee } from "@/types";
import {
  PROBABILITY_OPTIONS,
  RISK_LEVEL_META,
  RISK_LEVEL_ORDER,
  SEVERITY_OPTIONS,
  TOLERABILITY_LABELS,
  describeRisk,
} from "@/lib/sms/change-risk";
import { ChangeRequestFormValues } from "./CreateChangeRequestForm";

interface StepRisksAndDetailsProps {
  form: UseFormReturn<ChangeRequestFormValues>;
  employees: Employee[];
  isLoadingEmployees: boolean;
}

const TIME_UNIT_OPTIONS = [
  { value: "days", label: "Días" },
  { value: "weeks", label: "Semanas" },
  { value: "months", label: "Meses" },
  { value: "years", label: "Años" },
];

const preventWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  (e.target as HTMLInputElement).blur();

export function StepRisksAndDetails({
  form,
  employees,
  isLoadingEmployees,
}: StepRisksAndDetailsProps) {
  const {
    fields: riskFields,
    append: appendRisk,
    remove: removeRisk,
  } = useFieldArray({
    control: form.control,
    name: "risk_assessments",
  });

  const watchedRisks = useWatch({
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
        {riskFields.map((field, index) => {
          const risk = watchedRisks?.[index];
          const result = describeRisk(
            Number(risk?.probability_value ?? 0),
            risk?.severity_value ?? "",
          );

          return (
            <div
              key={field.id}
              className="grid grid-cols-1 items-start gap-3 rounded-md border border-border/30 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_150px_150px_180px_auto]"
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
                        className="min-h-15"
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
              <div className="flex flex-col gap-1 sm:mt-5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Resultado
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex min-w-9 items-center justify-center rounded-md border px-2 py-1 font-mono text-sm font-bold tabular-nums ${result.badgeClassName}`}
                  >
                    {result.index}
                  </span>
                  <Badge variant="outline" className={result.badgeClassName}>
                    {result.label}
                  </Badge>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {result.tolerabilityLabel}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="sm:mt-5"
                onClick={() => removeRisk(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          );
        })}

        <div className="flex flex-col gap-2 rounded-md border border-border/30 bg-muted/20 px-3 py-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Matriz: índice = probabilidad × severidad (A=5 … E=1)
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {RISK_LEVEL_ORDER.map((level) => {
              const meta = RISK_LEVEL_META[level];

              return (
                <div key={level} className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`size-2.5 rounded-full ${meta.dotClassName}`}
                  />
                  <span className="font-medium">{meta.label}</span>
                  <span className="font-mono text-muted-foreground">
                    {meta.range}
                  </span>
                  <span className="text-muted-foreground">
                    · {TOLERABILITY_LABELS[meta.tolerability]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
                  className="min-h-20"
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
                <DatePickerField
                  label="Fecha Estimada del Cambio"
                  value={
                    field.value ? new Date(field.value + "T00:00:00") : null
                  }
                  setValue={(d) =>
                    field.onChange(d ? d.toISOString().slice(0, 10) : null)
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cutoff_date"
            render={({ field }) => (
              <FormItem>
                <DatePickerField
                  label="Fecha de Corte"
                  value={
                    field.value ? new Date(field.value + "T00:00:00") : null
                  }
                  setValue={(d) =>
                    field.onChange(d ? d.toISOString().slice(0, 10) : null)
                  }
                />
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
                      <SelectTrigger className="w-30">
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
                <span className="text-sm text-muted-foreground">
                  Cargando...
                </span>
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
