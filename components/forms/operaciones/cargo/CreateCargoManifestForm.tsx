"use client";

import { useMemo, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { useGetAvailableShipments } from "@/hooks/operaciones/cargo/useGetAvailableShipments";
import {
  useCreateCargoManifest,
  ManifestItemPayload,
} from "@/actions/cargo/manifestActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
  registration_date: string;
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
  day: number;
  selectedAircraftId: number | null;
  externalAircraft: string | null;
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
  day,
  selectedAircraftId,
  externalAircraft,
  onSuccess,
}: Props) {
  const { data: availableShipments, isLoading: loadingAvailable } =
    useGetAvailableShipments(
      company,
      month,
      year,
      selectedAircraftId,
      externalAircraft,
      day,
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
        const ratio = item.weight / item.units;
        next.set(item.id, {
          shipment_id: item.cargo_shipment_id,
          weight: item.units_available * ratio,
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
            const ratio = i.weight / i.units;
            next.set(i.id, {
              shipment_id: i.cargo_shipment_id,
              weight: i.units_available * ratio,
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
    maxAvailableWeight: number,
    maxAvailableUnits: number,
    weightPerUnit: number,
  ) => {
    const calculatedUnits = Math.max(1, Math.round(value / weightPerUnit));

    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (!current) return prev;
      next.set(itemId, {
        ...current,
        weight: calculatedUnits * weightPerUnit,
        units: calculatedUnits,
      });
      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId) ?? {};
      const finalWeight = calculatedUnits * weightPerUnit;
      const hasWeightError =
        finalWeight < 0.01 || finalWeight > maxAvailableWeight;
      const hasUnitsError =
        calculatedUnits < 1 || calculatedUnits > maxAvailableUnits;

      if (hasWeightError || hasUnitsError) {
        next.set(itemId, {
          ...(hasWeightError
            ? { weight: `Debe ser entre 0.01 y ${maxAvailableWeight} Kg` }
            : {}),
          ...(hasUnitsError
            ? { units: `Debe ser entre 1 y ${maxAvailableUnits} Und` }
            : {}),
        });
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  // ── Actualizar unidades ──────────────────────────────────────────────────

  const updateUnits = (
    itemId: number,
    value: number,
    maxAvailableWeight: number,
    maxAvailableUnits: number,
    weightPerUnit: number,
  ) => {
    const calculatedWeight = value * weightPerUnit;

    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (!current) return prev;
      next.set(itemId, {
        ...current,
        weight: calculatedWeight,
        units: value,
      });
      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId) ?? {};
      const hasWeightError =
        calculatedWeight < 0.01 || calculatedWeight > maxAvailableWeight;
      const hasUnitsError = value < 1 || value > maxAvailableUnits;

      if (hasWeightError || hasUnitsError) {
        next.set(itemId, {
          ...(hasWeightError
            ? { weight: `Debe ser entre 0.01 y ${maxAvailableWeight} Kg` }
            : {}),
          ...(hasUnitsError
            ? { units: `Debe ser entre 1 y ${maxAvailableUnits} Und.` }
            : {}),
        });
      } else {
        next.delete(itemId);
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
        aircraft_id: selectedAircraftId,
        external_aircraft: externalAircraft || null,
        items,
      },
      { onSuccess },
    );
  };

  // ── Render loading ────────────────────────────────────────────────────────

  if (loadingAvailable) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Listado de Guías o Mensaje Sin Resultados */}
      {!availableShipments || availableShipments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No hay guías disponibles para este período.
        </p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {(availableShipments as ShipmentAvailable[]).map((shipment) => {
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

            const displayDate = shipment.registration_date
              ? (() => {
                  try {
                    const d = parseISO(shipment.registration_date);
                    if (!isValid(d)) return null;
                    const local = new Date(
                      d.getUTCFullYear(),
                      d.getUTCMonth(),
                      d.getUTCDate(),
                    );
                    return format(local, "dd/MM/yyyy");
                  } catch {
                    return null;
                  }
                })()
              : null;

            return (
              <div
                key={shipment.id}
                className="border border-border rounded-lg overflow-hidden"
              >
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

                    {displayDate && (
                      <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                        {displayDate}
                      </span>
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
                    <div className="grid grid-cols-[32px_1fr_100px_70px_100px_130px_130px] gap-2 px-4 py-1.5 bg-muted/5 border-b border-border/30">
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
                            "grid grid-cols-[32px_1fr_100px_70px_100px_130px_130px] gap-2 items-center px-4 py-2 border-b border-border/20 last:border-0 transition-colors",
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
                                (Manifestado)
                              </span>
                            )}
                          </span>

                          {/* Total */}
                          <span className="text-xs text-center text-muted-foreground">
                            {item.units} und / {Number(item.weight).toFixed(1)}{" "}
                            kg
                          </span>

                          {/* Ratio */}
                          <span className="text-xs text-center text-muted-foreground font-mono">
                            {(item.weight / item.units).toFixed(1)} Kg/und
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
                                      item.weight_available,
                                      item.units_available,
                                      item.weight / item.units,
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
                                      item.units_available,
                                      item.weight / item.units,
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
      )}

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
            createCargoManifest.isPending ||
            (!selectedAircraftId && !externalAircraft)
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
