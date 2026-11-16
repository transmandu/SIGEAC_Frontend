"use client";

import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
    <div className="border border-border rounded-xl shadow-xs bg-card overflow-hidden">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center">
        <h3
          className="text-xl font-semibold text-foreground sm:text-2xl"
          data-tour="cargo-crear-items-header"
        >
          Productos
        </h3>

        <div className="flex flex-1 justify-center">
          {useScale && <ScaleConnectionPanel />}
        </div>

        {/*             <div className="flex items-center gap-2">
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
        </div> */}
        <Button
          data-tour="cargo-crear-items-agregar"
          type="button"
          variant="default"
          size="sm"
          className="h-8 w-full text-xs font-semibold sm:w-auto"
          onClick={() =>
            append({ product_description: "", units: 1, weight: 0.1 })
          }
        >
          <Plus className="size-4 mr-1.5" /> Agregar fila
        </Button>
      </div>

      {/* Encabezados de columna: solo desde md. En móvil cada fila lleva su
          propia etiqueta para no comprimir los campos. */}
      <div
        data-tour="cargo-crear-items-columnas"
        className="hidden grid-cols-[1fr_120px_140px_48px] gap-2 border-b border-border/60 bg-muted/10 py-1.5 pl-4 pr-6 md:grid"
      >
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
        className={cn("pr-2", fields.length > 5 ? "md:h-80" : "md:max-h-80")}
      >
        <div className="space-y-0" data-tour="cargo-crear-items-row-{index}">
          {fields.map((field, index) => {
            const dispatchedUnits = Number(field.dispatched_units ?? 0);
            const dispatchedWeight = Number(field.dispatched_weight ?? 0);
            const manifested = dispatchedUnits > 0 || dispatchedWeight > 0;

            return (
              <div
                key={field.id}
                className="group grid grid-cols-1 gap-2 border-b border-border/30 px-3 py-3 transition-colors last:border-0 hover:bg-muted/30 md:grid-cols-[1fr_120px_140px_48px] md:items-center md:px-4 md:py-2"
              >
                <FormField
                  control={form.control}
                  name={`items.${index}.product_description`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <FormControl>
                            <ProductAutocompleteInput
                              company={company}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Ej. BOLSA CON GRIFO"
                              disabled={manifested}
                            />
                          </FormControl>
                        </div>
                        {manifested && (
                          <Badge
                            variant="warning"
                            className="shrink-0 px-1.5 py-0 text-[10px] uppercase tracking-wide"
                            title={`${dispatchedUnits} und. / ${dispatchedWeight} kg. despachados`}
                          >
                            Manifestado
                          </Badge>
                        )}
                      </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {/* Unidades, peso y acción: fila propia en móvil; desde md se
                    disuelven (display: contents) en las columnas de la grilla. */}
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 md:contents">
                  <div className="flex min-w-0 flex-col md:contents">
                    <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:hidden">
                      Unidades
                    </span>
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
                              disabled={manifested}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex min-w-0 flex-col md:contents">
                    <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:hidden">
                      Peso (KG)
                    </span>
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
                                disabled={manifested}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      {useScale && !manifested && (
                        <ScaleButton
                          onCapture={(result) => {
                            form.setValue(
                              `items.${index}.weight`,
                              result.weight,
                              {
                                shouldValidate: true,
                                shouldDirty: true,
                              },
                            );
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-end md:items-center">
                    {manifested ? (
                      <span
                        title="Ítem manifestado: no se puede modificar"
                        className="flex w-full justify-center text-muted-foreground"
                      >
                        <Lock className="size-4" />
                      </span>
                    ) : (
                      <Button
                        data-tour="cargo-crear-items-eliminar"
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className={cn(
                          "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity",
                          fields.length === 1 &&
                            "opacity-30 cursor-not-allowed",
                        )}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Totals footer */}
      <div className="grid grid-cols-1 gap-2 border-t-2 border-border/60 bg-muted/20 px-3 py-3 md:grid-cols-[1fr_120px_140px_48px] md:items-center md:rounded-b-xl md:py-2 md:pl-4 md:pr-6">
        <div
          className="text-center text-sm font-extrabold tracking-widest text-muted-foreground md:pr-4 md:text-right"
          data-tour="cargo-crear-items-total"
        >
          TOTAL
        </div>
        <div className="grid grid-cols-2 gap-2 md:contents">
          <div className="flex flex-col md:contents">
            <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:hidden">
              Unidades
            </span>
            <TotalCell value={String(totalUnits)} />
          </div>
          <div className="flex flex-col md:contents">
            <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:hidden">
              Peso (Kg)
            </span>
            <TotalCell
              value={totalWeight.toLocaleString("es-VE", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            />
          </div>
        </div>
        <div className="hidden md:block" />
      </div>
    </div>
  );
}

function TotalCell({ value }: { value: string }) {
  return (
    <div className="text-center font-bold text-sm bg-background py-1.5 rounded-md border border-border/50 shadow-xs text-primary tabular-nums">
      {value}
    </div>
  );
}
