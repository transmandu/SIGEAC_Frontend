"use client";

import { useMemo, useState } from "react";
import {
  useUpdateCargoManifest,
  ManifestItemUpdatePayload,
} from "@/actions/cargo/manifestActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ManifestShipmentItem {
  id: number;
  product_description: string;
  units: number;
  weight: number;
  // Calculados por el backend en index() excluyendo la contribución del manifiesto actual
  weight_available?: number;
  units_available?: number;
}

interface ManifestItem {
  id: number;
  cargo_shipment_id: number;
  cargo_shipment_item_id: number;
  weight_in_manifest: number;
  units_in_manifest: number;
  shipment?: {
    id: number;
    guide_number: string;
    client?: { name: string };
    aircraft?: { acronym: string };
    external_aircraft?: string;
    total_weight: number;
    weight_dispatched: number;
    total_units: number;
    units_dispatched: number;
  };
  shipment_item?: ManifestShipmentItem;
}

interface CargoManifest {
  id: number;
  manifest_number: string;
  month: number;
  year: number;
  items: ManifestItem[];
}

interface ItemState {
  weight: number;
  units: number;
  removed: boolean;
}

interface Props {
  manifest: CargoManifest;
  company: string;
  onSuccess?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UpdateCargoManifestForm({
  manifest,
  company,
  onSuccess,
}: Props) {
  const { updateCargoManifest } = useUpdateCargoManifest(company);

  // Inicializar estado con los valores actuales del manifiesto
  const [itemStates, setItemStates] = useState<Map<number, ItemState>>(() => {
    const map = new Map<number, ItemState>();
    manifest.items?.forEach((item) => {
      map.set(item.cargo_shipment_item_id, {
        weight: Number(item.weight_in_manifest),
        units: Number(item.units_in_manifest),
        removed: false,
      });
    });
    return map;
  });

  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // ── Disponibilidad por ítem ────────────────────────────────────────────────
  //
  // El backend calcula en el index():
  //   weight_available = item.weight - sum(otros manifiestos para ese ítem)
  //
  // Al editar, ese valor ya incluye el máximo que puede tener este manifiesto
  // (porque excluye la contribución del manifiesto actual al calcular "otros").

  const getAvailableWeight = (item: ManifestItem): number => {
    const sItem = item.shipment_item;
    if (!sItem) return Math.max(0, Number(item.weight_in_manifest));
    // weight_available ya viene del backend excluyendo este manifiesto
    return Math.max(0, Number(sItem.weight_available ?? sItem.weight));
  };

  const getAvailableUnits = (item: ManifestItem): number => {
    const sItem = item.shipment_item;
    if (!sItem) return Math.max(0, Number(item.units_in_manifest));
    return Math.max(0, Number(sItem.units_available ?? sItem.units));
  };

  // ── Manejadores ───────────────────────────────────────────────────────────

  const updateWeight = (
    shipmentItemId: number,
    value: number,
    maxAvailable: number,
  ) => {
    setItemStates((prev) => {
      const next = new Map(prev);
      const current = next.get(shipmentItemId)!;
      next.set(shipmentItemId, { ...current, weight: value });
      return next;
    });
    setErrors((prev) => {
      const next = new Map(prev);
      const key = `${shipmentItemId}-weight`;
      if (value < 0.01) next.set(key, "Mínimo: 0.01 kg");
      else if (value > maxAvailable)
        next.set(key, `Máximo: ${maxAvailable} kg`);
      else next.delete(key);
      return next;
    });
  };

  const updateUnits = (
    shipmentItemId: number,
    value: number,
    maxAvailable: number,
  ) => {
    setItemStates((prev) => {
      const next = new Map(prev);
      const current = next.get(shipmentItemId)!;
      next.set(shipmentItemId, { ...current, units: value });
      return next;
    });
    setErrors((prev) => {
      const next = new Map(prev);
      const key = `${shipmentItemId}-units`;
      if (value < 1) next.set(key, "Mínimo: 1");
      else if (value > maxAvailable) next.set(key, `Máximo: ${maxAvailable}`);
      else next.delete(key);
      return next;
    });
  };

  const toggleRemove = (
    shipmentItemId: number,
    originalWeight: number,
    originalUnits: number,
  ) => {
    setItemStates((prev) => {
      const next = new Map(prev);
      const current = next.get(shipmentItemId)!;
      const isRemoving = !current.removed;
      next.set(shipmentItemId, {
        removed: isRemoving,
        weight: isRemoving ? 0 : originalWeight,
        units: isRemoving ? 0 : originalUnits,
      });
      return next;
    });
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(`${shipmentItemId}-weight`);
      next.delete(`${shipmentItemId}-units`);
      return next;
    });
  };

  // ── Agrupar ítems por guía para mostrarlos agrupados ─────────────────────

  const groupedItems = useMemo(() => {
    const groups = new Map<
      number,
      { shipment: ManifestItem["shipment"]; items: ManifestItem[] }
    >();
    manifest.items?.forEach((item) => {
      if (!groups.has(item.cargo_shipment_id)) {
        groups.set(item.cargo_shipment_id, {
          shipment: item.shipment,
          items: [],
        });
      }
      groups.get(item.cargo_shipment_id)!.items.push(item);
    });
    return groups;
  }, [manifest.items]);

  // ── Totales ───────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalUnits = 0;
    let activeCount = 0;
    itemStates.forEach((state) => {
      if (!state.removed) {
        totalWeight += state.weight;
        totalUnits += state.units;
        activeCount++;
      }
    });
    return { totalWeight, totalUnits, activeCount };
  }, [itemStates]);

  // ── Detectar cambios reales ───────────────────────────────────────────────

  const hasChanges = useMemo(() => {
    for (const item of manifest.items ?? []) {
      const state = itemStates.get(item.cargo_shipment_item_id);
      if (!state) continue;
      if (state.removed) return true;
      if (state.weight !== Number(item.weight_in_manifest)) return true;
      if (state.units !== Number(item.units_in_manifest)) return true;
    }
    return false;
  }, [itemStates, manifest.items]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (errors.size > 0) return;

    const items: ManifestItemUpdatePayload[] = Array.from(
      itemStates.entries(),
    ).map(([shipment_item_id, state]) => {
      const originalItem = manifest.items?.find(
        (i) => i.cargo_shipment_item_id === shipment_item_id,
      );
      return {
        shipment_id: originalItem?.cargo_shipment_id || 0,
        shipment_item_id,
        weight_in_manifest: state.removed ? 0 : state.weight,
        units_in_manifest: state.removed ? 0 : state.units,
      };
    });

    updateCargoManifest.mutate(
      { id: manifest.id, data: { items } },
      { onSuccess },
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!manifest.items || manifest.items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Este manifiesto no tiene ítems.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {Array.from(groupedItems.entries()).map(([shipmentId, group]) => (
          <div
            key={shipmentId}
            className="border border-border rounded-lg overflow-hidden"
          >
            {/* Cabecera de la guía */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b border-border/50">
              <span className="font-semibold text-primary text-sm">
                {group.shipment?.guide_number ?? `Guía #${shipmentId}`}
              </span>
              <span className="text-sm text-muted-foreground">
                {group.shipment?.client?.name ?? "Sin cliente"}
              </span>
              <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
                {group.shipment?.aircraft?.acronym ??
                  group.shipment?.external_aircraft ??
                  "N/A"}
              </span>
            </div>

            {/* Columnas */}
            <div className="grid grid-cols-[1fr_110px_110px_110px_40px] gap-2 px-4 py-1.5 bg-muted/10 border-b border-border/30">
              {[
                "Producto",
                "Límite Máximo",
                "Peso a enviar",
                "Und. a enviar",
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
              const shipmentItemId = item.cargo_shipment_item_id;
              const state = itemStates.get(shipmentItemId);
              const weightError = errors.get(`${shipmentItemId}-weight`);
              const unitsError = errors.get(`${shipmentItemId}-units`);
              const availWeight = getAvailableWeight(item);
              const availUnits = getAvailableUnits(item);
              const isRemoved = state?.removed ?? false;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "grid grid-cols-[1fr_110px_110px_110px_40px] gap-2 items-center px-4 py-2 border-b border-border/20 last:border-0 transition-colors",
                    isRemoved && "opacity-40 bg-destructive/5",
                  )}
                >
                  {/* Descripción */}
                  <span
                    className={cn(
                      "text-sm truncate",
                      isRemoved && "line-through",
                    )}
                  >
                    {item.shipment_item?.product_description ??
                      `Ítem #${shipmentItemId}`}
                  </span>

                  {/* Disponible */}
                  <span className="text-xs text-center text-muted-foreground">
                    {isRemoved ? "—" : `${availWeight.toFixed(1)} kg`}
                  </span>

                  {/* Input peso */}
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
                            updateWeight(
                              shipmentItemId,
                              parseFloat(e.target.value) || 0,
                              availWeight,
                            )
                          }
                          className={cn(
                            "h-7 text-center text-xs",
                            weightError && "border-destructive",
                          )}
                        />
                        {weightError && (
                          <span className="text-[10px] text-destructive flex items-center gap-0.5 text-center leading-none">
                            <AlertCircle className="h-2.5 w-2.5 shrink-0" />{" "}
                            {weightError}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Input unidades */}
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
                            updateUnits(
                              shipmentItemId,
                              parseInt(e.target.value) || 0,
                              availUnits,
                            )
                          }
                          className={cn(
                            "h-7 text-center text-xs",
                            unitsError && "border-destructive",
                          )}
                        />
                        {unitsError && (
                          <span className="text-[10px] text-destructive flex items-center gap-0.5 text-center leading-none">
                            <AlertCircle className="h-2.5 w-2.5 shrink-0" />{" "}
                            {unitsError}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Botón quitar */}
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
                        toggleRemove(
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
            })}
          </div>
        ))}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {totals.activeCount}
          </span>{" "}
          ítem(s) activo(s) —{" "}
          <span className="font-semibold text-primary">
            {totals.totalWeight.toFixed(2)} kg
          </span>{" "}
          —{" "}
          <span className="font-semibold text-primary">
            {totals.totalUnits} und
          </span>
        </div>

        {errors.size > 0 && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Corrige los errores antes de guardar.
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            !hasChanges || errors.size > 0 || updateCargoManifest.isPending
          }
        >
          {updateCargoManifest.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </div>
  );
}
