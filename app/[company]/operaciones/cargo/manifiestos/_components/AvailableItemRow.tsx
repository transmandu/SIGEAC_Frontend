"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  item: any;
  isSelected: boolean;
  sel: { weight: number; units: number } | undefined;
  itemErrors: { weight?: string; units?: string } | undefined;
  onToggleNewItem: (item: any) => void;
  onUpdateNewWeight: (
    id: number,
    val: number,
    maxW: number,
    maxU: number,
    ratio: number,
  ) => void;
  onUpdateNewUnits: (
    id: number,
    val: number,
    maxW: number,
    maxU: number,
    ratio: number,
  ) => void;
}

export function AvailableItemRow({
  item,
  isSelected,
  sel,
  itemErrors,
  onToggleNewItem,
  onUpdateNewWeight,
  onUpdateNewUnits,
}: Props) {
  const ratio = item.weight / item.units;

  return (
    <div
      className={cn(
        "grid grid-cols-[32px_1fr_90px_70px_90px_120px_120px] gap-2 items-center px-4 py-2 border-b border-border/20 last:border-0 transition-colors",
        isSelected && "bg-primary/5",
        "hover:bg-muted/20 cursor-pointer",
      )}
      onClick={() => onToggleNewItem(item)}
    >
      {/* Checkbox */}
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleNewItem(item)}
        />
      </div>

      {/* Descripción */}
      <span className="text-sm truncate">{item.product_description}</span>

      {/* Total */}
      <span className="text-xs text-center text-muted-foreground">
        {item.units} und / {Number(item.weight).toFixed(1)} kg
      </span>

      {/* Ratio */}
      <span className="text-xs text-center text-muted-foreground font-mono">
        {ratio.toFixed(1)} Kg/und
      </span>

      {/* Despachado */}
      <span className="text-xs text-center text-muted-foreground">
        {item.units_dispatched} und /{" "}
        {Number(item.weight_dispatched).toFixed(1)} kg
      </span>

      {/* Unidades */}
      <div
        className="flex flex-col items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        {isSelected ? (
          <>
            <Input
              type="number"
              min={1}
              max={item.units_available}
              step={1}
              value={sel?.units || ""}
              placeholder="0"
              onChange={(e) =>
                onUpdateNewUnits(
                  item.id,
                  parseInt(e.target.value) || 0,
                  item.weight_available,
                  item.units_available,
                  ratio,
                )
              }
              className={cn(
                "h-7 w-20 text-center text-xs",
                itemErrors?.units && "border-destructive",
              )}
            />
            {itemErrors?.units && (
              <span className="text-[10px] text-destructive flex items-center gap-0.5">
                <AlertCircle className="h-2.5 w-2.5" /> {itemErrors.units}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>

      {/* Peso */}
      <div
        className="flex flex-col items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        {isSelected ? (
          <>
            <Input
              type="number"
              min={0.01}
              max={item.weight_available}
              step={0.01}
              value={sel?.weight || ""}
              placeholder="0"
              onChange={(e) =>
                onUpdateNewWeight(
                  item.id,
                  parseFloat(e.target.value) || 0,
                  item.weight_available,
                  item.units_available,
                  ratio,
                )
              }
              className={cn(
                "h-7 w-24 text-center text-xs",
                itemErrors?.weight && "border-destructive",
              )}
            />
            {itemErrors?.weight && (
              <span className="text-[10px] text-destructive flex items-center gap-0.5">
                <AlertCircle className="h-2.5 w-2.5" /> {itemErrors.weight}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>
    </div>
  );
}
