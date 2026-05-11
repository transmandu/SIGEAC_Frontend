"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { CargoShipmentFormValues } from "@/hooks/operaciones/cargo/useCargoShipmentForm";

interface ItemsTableProps {
  form: UseFormReturn<CargoShipmentFormValues>;
  totalUnits: number;
  totalWeight: number;
}

export function ItemsTable({ form, totalUnits, totalWeight }: ItemsTableProps) {
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  return (
    <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-border/80 bg-muted/20">
        <h3 className="font-semibold text-foreground">Productos</h3>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-8 text-xs font-semibold"
          onClick={() =>
            append({ product_description: "", units: 1, weight: 0.1 })
          }
        >
          <Plus className="size-4 mr-1.5" /> Agregar fila
        </Button>
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
        <div className="space-y-0">
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
                      <Input
                        placeholder="Ej. BOLSA CON GRIFO"
                        className="bg-transparent h-8 text-sm focus-visible:bg-background"
                        {...field}
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

              <FormField
                control={form.control}
                name={`items.${index}.weight`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
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

              <div className="flex justify-end items-center">
                <Button
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
        <div className="text-right text-sm font-extrabold tracking-widest text-muted-foreground pr-4">
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
