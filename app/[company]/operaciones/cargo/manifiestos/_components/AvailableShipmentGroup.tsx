"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AvailableItemRow } from "./AvailableItemRow";

interface Props {
  shipment: any;
  newSelections: Map<
    number,
    { shipment_id: number; weight: number; units: number }
  >;
  newErrors: Map<number, { weight?: string; units?: string }>;
  statusConfig: Record<string, { label: string; className: string }>;
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

export function AvailableShipmentGroup({
  shipment,
  newSelections,
  newErrors,
  statusConfig,
  onToggleNewItem,
  onUpdateNewWeight,
  onUpdateNewUnits,
}: Props) {
  const availItems = shipment.items;
  const someSelected = availItems.some((i: any) => newSelections.has(i.id));
  const status = statusConfig[shipment.manifest_status] ?? statusConfig.pending;
  const aircraftLabel =
    shipment.aircraft?.acronym ?? shipment.external_aircraft ?? "N/A";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header de la guía */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-primary text-sm">
            {shipment.guide_number}
          </span>
          <span className="text-sm text-muted-foreground">
            {shipment.client?.name ?? "Sin cliente"}
          </span>
          <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
            {aircraftLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <span className="text-xs text-primary font-medium">
              {availItems.filter((i: any) => newSelections.has(i.id)).length}/
              {availItems.length} seleccionados
            </span>
          )}
          <Badge className={cn("text-[10px] px-1.5 py-0.5", status.className)}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Encabezados de columnas */}
      <div className="grid grid-cols-[32px_1fr_90px_70px_90px_120px_120px] gap-2 px-4 py-1.5 bg-muted/5 border-b border-border/30">
        {[
          "",
          "Producto",
          "Total",
          "Peso/Und",
          "Despach.",
          "Und. a enviar",
          "Peso a enviar",
        ].map((h) => (
          <span
            key={h}
            className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-center first:text-left"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Items de la guía */}
      {availItems.map((item: any) => (
        <AvailableItemRow
          key={item.id}
          item={item}
          isSelected={newSelections.has(item.id)}
          sel={newSelections.get(item.id)}
          itemErrors={newErrors.get(item.id)}
          onToggleNewItem={onToggleNewItem}
          onUpdateNewWeight={onUpdateNewWeight}
          onUpdateNewUnits={onUpdateNewUnits}
        />
      ))}
    </div>
  );
}
