"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTING_METHOD_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogCountingMethod, CatalogInterval } from "@/types/maintenanceCatalog";
import { cn } from "@/lib/utils";

const ALL_COUNTING_METHODS = Object.keys(COUNTING_METHOD_LABELS) as CatalogCountingMethod[];

interface IntervalListEditorProps {
  intervals: CatalogInterval[];
  onChange: (intervals: CatalogInterval[]) => void;
  fieldClass?: string;
  selectTriggerClass?: string;
  labelClass?: string;
}

/**
 * N intervalos de vencimiento (unidad + valor) para un servicio/tarea del
 * catálogo — vacío es válido (certificado estático sin periodicidad, o
 * tarea que hereda la del servicio). Máximo uno por unidad, mismo criterio
 * que MaintenanceControlItem en el formulario de Control de Mantenimiento.
 */
export function IntervalListEditor({
  intervals,
  onChange,
  fieldClass,
  selectTriggerClass,
  labelClass,
}: IntervalListEditorProps) {
  const usedMethods = intervals.map((i) => i.counting_method);
  const canAdd = intervals.length < ALL_COUNTING_METHODS.length;

  const updateInterval = (index: number, patch: Partial<CatalogInterval>) => {
    onChange(intervals.map((interval, i) => (i === index ? { ...interval, ...patch } : interval)));
  };

  const removeInterval = (index: number) => {
    onChange(intervals.filter((_, i) => i !== index));
  };

  const addInterval = () => {
    const nextMethod = ALL_COUNTING_METHODS.find((m) => !usedMethods.includes(m));
    if (!nextMethod) return;
    onChange([...intervals, { counting_method: nextMethod, interval_value: 0 }]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className={labelClass}>Intervalos de vencimiento</Label>
        <Button type="button" variant="outline" size="sm" disabled={!canAdd} onClick={addInterval} className="gap-1.5">
          <Plus className="size-3.5" />
          Agregar intervalo
        </Button>
      </div>

      {intervals.length === 0 && (
        <p className="text-xs italic text-muted-foreground">
          Sin intervalos: certificado estático sin periodicidad recurrente.
        </p>
      )}

      {intervals.map((interval, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="shrink-0 text-xs italic text-muted-foreground">Ó</span>}

          <Select
            value={interval.counting_method}
            onValueChange={(v) => updateInterval(index, { counting_method: v as CatalogCountingMethod })}
          >
            <SelectTrigger className={cn(selectTriggerClass, "w-32 shrink-0")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_COUNTING_METHODS.filter(
                (unit) => unit === interval.counting_method || !usedMethods.includes(unit),
              ).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {COUNTING_METHOD_LABELS[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min={0}
            step="any"
            required
            className={fieldClass}
            value={interval.interval_value}
            onChange={(e) => updateInterval(index, { interval_value: Number(e.target.value) })}
            placeholder="Ej: 100"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeInterval(index)}
            aria-label="Quitar intervalo"
            className="shrink-0 text-muted-foreground/70 hover:text-destructive"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
