"use client";

import { CargoManifestItem } from "@/types";
import { ExistingItemRow } from "./ExistingItemRow";

interface Props {
  shipmentId: number;
  group: {
    guide_number: string;
    client?: { name: string };
    aircraft?: { acronym: string };
    external_aircraft?: string | null;
    items: CargoManifestItem[];
  };
  itemStates: Map<number, { weight: number; units: number; removed: boolean }>;
  errors: Map<string, string>;
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

export function ExistingShipmentGroup({
  shipmentId,
  group,
  itemStates,
  errors,
  onUpdateWeight,
  onUpdateUnits,
  onToggleRemove,
}: Props) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Cabecera de la guía */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b border-border/50">
        <span className="font-semibold text-primary text-sm">
          {group.guide_number}
        </span>
        <span className="text-sm text-muted-foreground">
          {group.client?.name ?? "Sin cliente"}
        </span>
        <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
          {group.aircraft?.acronym ?? group.external_aircraft ?? "N/A"}
        </span>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-[1fr_70px_130px_110px_110px_40px] gap-2 px-4 py-1.5 bg-muted/10 border-b border-border/30">
        {[
          "Producto",
          "Peso/Und",
          "Disponible",
          "Und. a enviar",
          "Peso a enviar",
          "",
        ].map((h) => (
          <span
            key={h}
            className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-center first:text-left"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Filas de ítems */}
      {group.items.map((item) => {
        const shipmentItemId = Number(item.cargo_shipment_item_id);
        return (
          <ExistingItemRow
            key={item.id}
            item={item}
            state={itemStates.get(shipmentItemId)}
            weightError={errors.get(`${shipmentItemId}-weight`)}
            unitsError={errors.get(`${shipmentItemId}-units`)}
            onUpdateWeight={onUpdateWeight}
            onUpdateUnits={onUpdateUnits}
            onToggleRemove={onToggleRemove}
          />
        );
      })}
    </div>
  );
}
