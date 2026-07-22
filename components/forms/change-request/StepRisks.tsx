import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { StoreChangeRequestPayload } from "@/types";

interface StepRisksProps {
  form: UseFormReturn<StoreChangeRequestPayload>;
}

const SEVERITY_OPTIONS = [
  { value: "1", label: "A — Catastrófico" },
  { value: "2", label: "B — Peligroso" },
  { value: "3", label: "C — Mayor" },
  { value: "4", label: "D — Menor" },
  { value: "5", label: "E — Insignificante" },
];

const PROBABILITY_OPTIONS = [
  { value: "1", label: "1 — Extremadamente Improbable" },
  { value: "2", label: "2 — Improbable" },
  { value: "3", label: "3 — Remoto" },
  { value: "4", label: "4 — Ocasional" },
  { value: "5", label: "5 — Frecuente" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — Dólar" },
  { value: "VES", label: "VES — Bolívar" },
  { value: "EUR", label: "EUR — Euro" },
];

const preventWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  (e.target as HTMLInputElement).blur();

export function StepRisks({ form }: StepRisksProps) {
  const {
    fields: riskFields,
    append: appendRisk,
    remove: removeRisk,
  } = useFieldArray({
    control: form.control,
    name: "risk_assessments",
  });

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

  return (
    <div className="flex flex-col gap-6">
      {/* Riesgos */}
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
                severity_value: 1,
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
                    onValueChange={(val) => field.onChange(Number(val))}
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
    </div>
  );
}
