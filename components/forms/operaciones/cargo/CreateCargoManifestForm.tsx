"use client";

import { useMemo, useState } from "react";
import { useGetAvailableShipments } from "@/hooks/operaciones/cargo/useGetAvailableShipments";
import {
  useCreateCargoManifest,
  ManifestItemPayload,
} from "@/actions/cargo/manifestActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ShipmentItemAvailable {
  id: number;
  cargo_shipment_id: number;
  product_description: string;
  units: number;
  weight: number;
  weight_dispatched: number;
  units_dispatched: number;
  weight_available: number;
  units_available: number;
}

interface ShipmentAvailable {
  id: number;
  guide_number: string;
  manifest_status: string;
  client?: { name: string };
  aircraft?: { acronym: string };
  external_aircraft?: string;
  items: ShipmentItemAvailable[];
}

interface ItemSelection {
  shipment_id: number;
  weight: number;
  units: number;
}

interface ItemErrors {
  weight?: string;
  units?: string;
}

interface Props {
  company: string;
  month: number;
  year: number;
  onSuccess: () => void;
}

// ─── Badges de estado ─────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-muted text-muted-foreground" },
  partial: { label: "Parcial", className: "bg-yellow-100 text-yellow-800" },
  modified: { label: "Modificado", className: "bg-orange-100 text-orange-800" },
  manifested: {
    label: "Manifestado",
    className: "bg-green-100 text-green-800",
  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CreateCargoManifestForm({
  company,
  month,
  year,
  onSuccess,
}: Props) {
  const { data: shipments, isLoading } = useGetAvailableShipments(
    company,
    month,
    year,
  );

  const { createCargoManifest } = useCreateCargoManifest(company);

  // Map<shipment_item_id, ItemSelection>
  const [selections, setSelections] = useState<Map<number, ItemSelection>>(
    new Map(),
  );

  // Map<shipment_item_id, ItemErrors>
  const [errors, setErrors] = useState<Map<number, ItemErrors>>(new Map());

  // Guías colapsadas
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // ── Validación global de errores ──────────────────────────────────────────

  const hasErrors = useMemo(() => {
    return Array.from(errors.values()).some((e) => e.weight || e.units);
  }, [errors]);

  // ── Toggle colapsar guía ──────────────────────────────────────────────────

  const toggleCollapse = (shipmentId: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);

      next.has(shipmentId) ? next.delete(shipmentId) : next.add(shipmentId);

      return next;
    });
  };

  // ── Seleccionar / deseleccionar un ítem ───────────────────────────────────

  const toggleItem = (item: ShipmentItemAvailable) => {
    setSelections((prev) => {
      const next = new Map(prev);

      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, {
          shipment_id: item.cargo_shipment_id,
          weight: item.weight_available,
          units: item.units_available,
        });
      }

      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(item.id);
      return next;
    });
  };

  // ── Seleccionar / deseleccionar todos ────────────────────────────────────

  const toggleAllItems = (shipment: ShipmentAvailable) => {
    const availableItems = shipment.items.filter((i) => i.weight_available > 0);

    const allSelected = availableItems.every((i) => selections.has(i.id));

    setSelections((prev) => {
      const next = new Map(prev);

      if (allSelected) {
        availableItems.forEach((i) => next.delete(i.id));
      } else {
        availableItems.forEach((i) => {
          if (!next.has(i.id)) {
            next.set(i.id, {
              shipment_id: i.cargo_shipment_id,
              weight: i.weight_available,
              units: i.units_available,
            });
          }
        });
      }

      return next;
    });
  };

  // ── Actualizar peso ───────────────────────────────────────────────────────

  const updateWeight = (
    itemId: number,
    value: number,
    maxAvailable: number,
  ) => {
    setSelections((prev) => {
      const next = new Map(prev);

      const current = next.get(itemId);

      if (!current) return prev;

      next.set(itemId, {
        ...current,
        weight: value,
      });

      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);

      const current = next.get(itemId) ?? {};

      if (value < 0.01) {
        next.set(itemId, {
          ...current,
          weight: "Mínimo: 0.01 kg",
        });
      } else if (value > maxAvailable) {
        next.set(itemId, {
          ...current,
          weight: `Máximo: ${maxAvailable} kg`,
        });
      } else {
        const updated = { ...current };

        delete updated.weight;

        if (!updated.units) {
          next.delete(itemId);
        } else {
          next.set(itemId, updated);
        }
      }

      return next;
    });
  };

  // ── Actualizar unidades ──────────────────────────────────────────────────

  const updateUnits = (itemId: number, value: number, maxAvailable: number) => {
    setSelections((prev) => {
      const next = new Map(prev);

      const current = next.get(itemId);

      if (!current) return prev;

      next.set(itemId, {
        ...current,
        units: value,
      });

      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);

      const current = next.get(itemId) ?? {};

      if (value < 1) {
        next.set(itemId, {
          ...current,
          units: "Mínimo: 1",
        });
      } else if (value > maxAvailable) {
        next.set(itemId, {
          ...current,
          units: `Máximo: ${maxAvailable}`,
        });
      } else {
        const updated = { ...current };

        delete updated.units;

        if (!updated.weight) {
          next.delete(itemId);
        } else {
          next.set(itemId, updated);
        }
      }

      return next;
    });
  };

  // ── Totales ───────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalUnits = 0;

    selections.forEach((sel) => {
      totalWeight += sel.weight;
      totalUnits += sel.units;
    });

    return {
      count: selections.size,
      totalWeight,
      totalUnits,
    };
  }, [selections]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (selections.size === 0 || hasErrors) return;

    const items: ManifestItemPayload[] = Array.from(selections.entries()).map(
      ([shipment_item_id, sel]) => ({
        shipment_id: sel.shipment_id,
        shipment_item_id,
        weight_in_manifest: sel.weight,
        units_in_manifest: sel.units,
      }),
    );

    createCargoManifest.mutate(
      {
        month,
        year,
        items,
      },
      { onSuccess },
    );
  };

  // ── Render loading ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // ── Sin resultados ────────────────────────────────────────────────────────

  if (!shipments || shipments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay guías disponibles para este período.
      </p>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {(shipments as ShipmentAvailable[]).map((shipment) => {
          const isCollapsed = collapsed.has(shipment.id);

          const availItems = shipment.items.filter(
            (i) => i.weight_available > 0,
          );

          const allSelected =
            availItems.length > 0 &&
            availItems.every((i) => selections.has(i.id));

          const someSelected = availItems.some((i) => selections.has(i.id));

          const status =
            statusConfig[shipment.manifest_status] ?? statusConfig.pending;

          const aircraftLabel =
            shipment.aircraft?.acronym ?? shipment.external_aircraft ?? "N/A";

          return (
            <div
              key={shipment.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-2.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCollapse(shipment.id)}
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}

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
                      {availItems.filter((i) => selections.has(i.id)).length}/
                      {availItems.length} seleccionados
                    </span>
                  )}

                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0.5",
                      status.className,
                    )}
                  >
                    {status.label}
                  </Badge>
                </div>
              </div>

              {/* Contenido */}
              {!isCollapsed && (
                <div>
                  {/* Seleccionar todos */}
                  {availItems.length > 0 && (
                    <div
                      className="flex items-center gap-2 px-4 py-1.5 border-b border-border/50 bg-muted/10 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleAllItems(shipment)}
                    >
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleAllItems(shipment)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <span className="text-xs text-muted-foreground font-medium">
                        Seleccionar todos los productos
                      </span>
                    </div>
                  )}

                  {/* Encabezados */}
                  <div className="grid grid-cols-[32px_1fr_100px_100px_130px_130px] gap-2 px-4 py-1.5 bg-muted/5 border-b border-border/30">
                    {[
                      "",
                      "Producto",
                      "Total",
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

                  {/* Items */}
                  {shipment.items.map((item) => {
                    const isSelected = selections.has(item.id);

                    const sel = selections.get(item.id);

                    const itemErrors = errors.get(item.id);

                    const isExhausted = item.weight_available <= 0;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "grid grid-cols-[32px_1fr_100px_100px_130px_130px] gap-2 items-center px-4 py-2 border-b border-border/20 last:border-0 transition-colors",
                          isSelected && "bg-primary/5",
                          isExhausted && "opacity-40 cursor-not-allowed",
                          !isExhausted && "hover:bg-muted/20 cursor-pointer",
                        )}
                        onClick={() => !isExhausted && toggleItem(item)}
                      >
                        {/* Checkbox */}
                        <div
                          className="flex justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isExhausted}
                            onCheckedChange={() =>
                              !isExhausted && toggleItem(item)
                            }
                          />
                        </div>

                        {/* Descripción */}
                        <span className="text-sm truncate">
                          {item.product_description}

                          {isExhausted && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              (agotado)
                            </span>
                          )}
                        </span>

                        {/* Total */}
                        <span className="text-xs text-center text-muted-foreground">
                          {item.units} und / {Number(item.weight).toFixed(1)} kg
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
                                  updateUnits(
                                    item.id,
                                    parseInt(e.target.value) || 0,
                                    item.units_available,
                                  )
                                }
                                className={cn(
                                  "h-7 w-20 text-center text-xs",
                                  itemErrors?.units && "border-destructive",
                                )}
                              />

                              {itemErrors?.units && (
                                <span className="text-[10px] text-destructive flex items-center gap-0.5">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {itemErrors.units}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
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
                                  updateWeight(
                                    item.id,
                                    parseFloat(e.target.value) || 0,
                                    item.weight_available,
                                  )
                                }
                                className={cn(
                                  "h-7 w-24 text-center text-xs",
                                  itemErrors?.weight && "border-destructive",
                                )}
                              />

                              {itemErrors?.weight && (
                                <span className="text-[10px] text-destructive flex items-center gap-0.5">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {itemErrors.weight}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-sm text-muted-foreground">
          {totals.count > 0 ? (
            <span>
              <span className="font-semibold text-foreground">
                {totals.count}
              </span>{" "}
              ítem(s) —{" "}
              <span className="font-semibold text-primary">
                {totals.totalWeight.toFixed(2)} kg
              </span>{" "}
              —{" "}
              <span className="font-semibold text-primary">
                {totals.totalUnits} und
              </span>
            </span>
          ) : (
            "Ningún ítem seleccionado"
          )}
        </div>

        {hasErrors && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Corrige los errores antes de continuar.
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            selections.size === 0 || hasErrors || createCargoManifest.isPending
          }
        >
          {createCargoManifest.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Generando...
            </>
          ) : (
            "Generar Manifiesto"
          )}
        </Button>
      </div>
    </div>
  );
}
