"use client";

import { useMemo, useState } from "react";
import { CargoManifest, CargoManifestItem } from "@/types";

export interface ItemState {
  weight: number;
  units: number;
  removed: boolean;
}

export function useManifestEditor(manifest: CargoManifest) {
  const [itemStates, setItemStates] = useState<Map<number, ItemState>>(() => {
    const map = new Map<number, ItemState>();
    manifest.items?.forEach((item) => {
      map.set(Number(item.cargo_shipment_item_id), {
        weight: Number(item.weight_in_manifest),
        units: Number(item.units_in_manifest),
        removed: false,
      });
    });
    return map;
  });

  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const updateWeight = (
    shipmentItemId: number,
    value: number,
    maxAvailableWeight: number,
    maxAvailableUnits: number,
    weightPerUnit: number,
  ) => {
    const calculatedUnits = Math.max(1, Math.round(value / weightPerUnit));

    setItemStates((prev) => {
      const next = new Map(prev);
      const current = next.get(shipmentItemId);
      if (!current) return prev;
      next.set(shipmentItemId, {
        ...current,
        weight: calculatedUnits * weightPerUnit,
        units: calculatedUnits,
      });
      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);
      const weightKey = `${shipmentItemId}-weight`;
      const unitsKey = `${shipmentItemId}-units`;
      const finalWeight = calculatedUnits * weightPerUnit;
      const hasWeightError =
        finalWeight < 0.01 || finalWeight > maxAvailableWeight;
      const hasUnitsError =
        calculatedUnits < 1 || calculatedUnits > maxAvailableUnits;

      next.delete(weightKey);
      next.delete(unitsKey);

      if (hasWeightError)
        next.set(weightKey, `Debe ser entre 0.01 y ${maxAvailableWeight} Kg.`);
      if (hasUnitsError)
        next.set(unitsKey, `Debe ser entre 1 y ${maxAvailableUnits} Und.`);

      return next;
    });
  };

  const updateUnits = (
    shipmentItemId: number,
    value: number,
    maxAvailableWeight: number,
    maxAvailableUnits: number,
    weightPerUnit: number,
  ) => {
    const calculatedWeight = value * weightPerUnit;

    setItemStates((prev) => {
      const next = new Map(prev);
      const current = next.get(shipmentItemId);
      if (!current) return prev;

      next.set(shipmentItemId, {
        ...current,
        weight: calculatedWeight,
        units: value,
      });
      return next;
    });

    setErrors((prev) => {
      const next = new Map(prev);
      const weightKey = `${shipmentItemId}-weight`;
      const unitsKey = `${shipmentItemId}-units`;
      const hasWeightError =
        calculatedWeight < 0.01 || calculatedWeight > maxAvailableWeight;
      const hasUnitsError = value < 1 || value > maxAvailableUnits;

      next.delete(weightKey);
      next.delete(unitsKey);

      if (hasWeightError)
        next.set(weightKey, `Debe ser entre 0.01 y ${maxAvailableWeight} Kg.`);
      if (hasUnitsError)
        next.set(unitsKey, `Debe ser entre 1 y ${maxAvailableUnits} Und.`);

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

  const shipmentGroups = useMemo(() => {
    const groups = new Map<
      number,
      {
        guide_number: string;
        client?: { name: string };
        aircraft?: { acronym: string };
        external_aircraft?: string | null;
        items: CargoManifestItem[];
      }
    >();
    manifest.items?.forEach((item) => {
      const sid = Number(item.cargo_shipment_id);
      if (!groups.has(sid)) {
        groups.set(sid, {
          guide_number: item.shipment?.guide_number ?? `Guía #${sid}`,
          client: item.shipment?.client,
          aircraft: item.shipment?.aircraft,
          external_aircraft: item.shipment?.external_aircraft ?? undefined,
          items: [],
        });
      }
      groups.get(sid)!.items.push(item);
    });
    return Array.from(groups.entries()).sort(([, a], [, b]) =>
      a.guide_number.localeCompare(b.guide_number),
    );
  }, [manifest.items]);

  const hasChanges = useMemo(() => {
    for (const item of manifest.items ?? []) {
      const state = itemStates.get(Number(item.cargo_shipment_item_id));
      if (!state) continue;
      if (state.removed) return true;
      if (state.weight !== Number(item.weight_in_manifest)) return true;
      if (state.units !== Number(item.units_in_manifest)) return true;
    }
    return false;
  }, [itemStates, manifest.items]);

  return {
    itemStates,
    errors,
    shipmentGroups,
    updateWeight,
    updateUnits,
    toggleRemove,
    hasChanges,
  };
}
