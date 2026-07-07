"use client";

import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { CargoShipmentFormValues } from "@/hooks/operaciones/cargo/useCargoShipmentForm";
import { ProductAutocompleteInput } from "./ProductAutoCompleteInput";
import { ScaleButton } from "@/components/ui/scale/ScaleButton";
import { ScaleConnectionPanel } from "@/components/ui/scale/ScaleConnectionPanel";

interface ItemsTableProps {
  form: UseFormReturn<CargoShipmentFormValues>;
  totalUnits: number;
  totalWeight: number;
  company: string;
}

export function ItemsTable({
  form,
  totalUnits,
  totalWeight,
  company,
}: ItemsTableProps) {
  const [useScale, setUseScale] = useState(false);
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  return (
    <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center px-4 py-4 border-b border-border/80 bg-muted/20">
        <div className="flex items-center gap-6 w-1/3">
          <h3 className="font-semibold text-foreground text-2xl" data-tour="cargo-crear-items-header">Productos</h3>
        </div>

        <div className="flex-1 flex justify-center min-w-[500px]">
          {useScale && <ScaleConnectionPanel />}
        </div>

        <div className="w-1/3 flex justify-end">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Checkbox
                data-tour="cargo-crear-items-usar-balanza"
                id="use-scale-toggle"
                checked={useScale}
                onCheckedChange={(checked) => setUseScale(!!checked)}
              />
              <label
                htmlFor="use-scale-toggle"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
              >
                Usar balanza
              </label>
            </div>
            <Button
              data-tour="cargo-crear-items-agregar"
              type="button"
              variant="default"
              size="sm"
              className="h-8 text-xs font-semibold w-full"
              onClick={() =>
                append({ product_description: "", units: 1, weight: 0.1 })
              }
            >
              <Plus className="size-4 mr-1.5" /> Agregar fila
            </Button>
          </div>
        </div>
      </div>

      {/* Encabezados de columna */}
      <div className="grid grid-cols-[1fr_120px_140px_48px] gap-2 pl-4 pr-6 py-1.5 border-b border-border/60 bg-muted/10">
        {["Producto", "Unidades", "Peso (KG)", ""].map((col) => (
          <span
            key={col}
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center first:text-left"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Filas */}
      <ScrollArea
        className={cn(
          "pr-2",
          fields.length > 5 ? "h-[320px]" : "h-auto max-h-[320px]",
        )}
      >
        <div className="space-y-0" data-tour="cargo-crear-items-row-{index}">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_120px_140px_48px] gap-2 items-center px-4 py-2 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors group"
            >
              <FormField
                control={form.control}
                name={`items.${index}.product_description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ProductAutocompleteInput
                        company={company}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Ej. BOLSA CON GRIFO"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.units`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        data-tour="cargo-crear-items-unidades"
                        type="number"
                        min="1"
                        className="bg-transparent h-8 text-sm text-center tabular-nums focus-visible:bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-1">
                <FormField
                  control={form.control}
                  name={`items.${index}.weight`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          data-tour="cargo-crear-items-peso"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-9 text-center"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                {useScale && (
                  <ScaleButton
                    onCapture={(result) => {
                      form.setValue(`items.${index}.weight`, result.weight, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                )}
              </div>

              <div className="flex justify-end items-center">
                <Button
                  data-tour="cargo-crear-items-eliminar"
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className={cn(
                    "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity",
                    fields.length === 1 && "opacity-30 cursor-not-allowed",
                  )}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Totals footer */}
      <div className="grid grid-cols-[1fr_120px_140px_48px] gap-2 items-center pl-4 pr-6 py-2 border-t-2 border-border/60 bg-muted/20 rounded-b-xl">
        <div className="text-right text-sm font-extrabold tracking-widest text-muted-foreground pr-4" data-tour="cargo-crear-items-total">
          TOTAL
        </div>
        <TotalCell value={String(totalUnits)} />
        <TotalCell
          value={totalWeight.toLocaleString("es-VE", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
          })}
        />
        <div />
      </div>
    </div>
  );
}

function TotalCell({ value }: { value: string }) {
  return (
    <div className="text-center font-bold text-sm bg-background py-1.5 rounded-md border border-border/50 shadow-sm text-primary tabular-nums">
      {value}
    </div>
  );
}
