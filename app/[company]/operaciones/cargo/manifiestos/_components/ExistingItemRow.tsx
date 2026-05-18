"use client";

import { CargoManifestItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getRatio,
  getAvailableWeight,
  getAvailableUnits,
  getItemDescription,
} from "@/lib/cargo/manifest-utils";

interface Props {
  item: CargoManifestItem;
  state: { weight: number; units: number; removed: boolean } | undefined;
  weightError: string | undefined;
  unitsError: string | undefined;
  onUpdateWeight: (
    id: number,
    val: number,
    maxW: number,
    maxU: number,
    ratio: number,
  ) => void;
  onUpdateUnits: (
    id: number,
    val: number,
    maxW: number,
    maxU: number,
    ratio: number,
  ) => void;
  onToggleRemove: (id: number, origW: number, origU: number) => void;
}

export function ExistingItemRow({
  item,
  state,
  weightError,
  unitsError,
  onUpdateWeight,
  onUpdateUnits,
  onToggleRemove,
}: Props) {
  const shipmentItemId = Number(item.cargo_shipment_item_id);
  const availWeight = getAvailableWeight(item);
  const availUnits = getAvailableUnits(item);
  const isRemoved = state?.removed ?? false;
  const ratio = getRatio(item);

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_70px_130px_110px_110px_40px] gap-2 items-center px-4 py-2 border-b border-border/20 transition-colors",
        isRemoved && "opacity-40 bg-destructive/5",
      )}
    >
      {/* Descripción */}
      <span className={cn("text-sm truncate", isRemoved && "line-through")}>
        {getItemDescription(item)}
      </span>

      {/* Peso/Und */}
      <span className="text-[10px] text-center text-muted-foreground font-mono">
        {ratio.toFixed(1)} Kg/und
      </span>

      {/* Disponible dinámico */}
      <span className="text-xs text-muted-foreground text-center">
        {isRemoved
          ? "—"
          : `${Math.max(0, availUnits - (state?.units ?? 0))} und / ${Math.max(
              0,
              availWeight - (state?.weight ?? 0),
            ).toFixed(1)} kg`}
      </span>

      {/* Und a enviar */}
      <div className="flex flex-col items-center gap-0.5">
        {isRemoved ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <>
            <Input
              type="number"
              min={1}
              max={availUnits}
              step={1}
              value={state?.units || ""}
              placeholder="0"
              onChange={(e) =>
                onUpdateUnits(
                  shipmentItemId,
                  parseInt(e.target.value) || 0,
                  availWeight,
                  availUnits,
                  ratio,
                )
              }
              className={cn(
                "h-7 text-center text-xs",
                unitsError && "border-destructive",
              )}
            />
            {unitsError && (
              <span className="text-[10px] text-destructive flex items-center gap-0.5 text-center leading-none">
                <AlertCircle className="h-2.5 w-2.5 shrink-0" /> {unitsError}
              </span>
            )}
          </>
        )}
      </div>

      {/* Peso a enviar */}
      <div className="flex flex-col items-center gap-0.5">
        {isRemoved ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <>
            <Input
              type="number"
              min={0.01}
              max={availWeight}
              step={0.01}
              value={state?.weight || ""}
              placeholder="0"
              onChange={(e) =>
                onUpdateWeight(
                  shipmentItemId,
                  parseFloat(e.target.value) || 0,
                  availWeight,
                  availUnits,
                  ratio,
                )
              }
              className={cn(
                "h-7 text-center text-xs",
                weightError && "border-destructive",
              )}
            />
            {weightError && (
              <span className="text-[10px] text-destructive flex items-center gap-0.5 text-center leading-none">
                <AlertCircle className="h-2.5 w-2.5 shrink-0" /> {weightError}
              </span>
            )}
          </>
        )}
      </div>

      {/* Botón quitar/restaurar */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant={isRemoved ? "outline" : "ghost"}
          size="icon"
          className={cn(
            "h-7 w-7",
            !isRemoved &&
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isRemoved && "text-primary",
          )}
          onClick={() =>
            onToggleRemove(
              shipmentItemId,
              Number(item.weight_in_manifest),
              Number(item.units_in_manifest),
            )
          }
          title={isRemoved ? "Restaurar" : "Quitar del manifiesto"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
