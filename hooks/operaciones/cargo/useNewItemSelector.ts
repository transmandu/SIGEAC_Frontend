"use client";

import { useState, useMemo } from "react";

export interface NewItemSelection {
  shipment_id: number;
  weight: number;
  units: number;
}

export function useNewItemSelector() {
  const [newSelections, setNewSelections] = useState<
    Map<number, NewItemSelection>
  >(new Map());
  const [newErrors, setNewErrors] = useState<
    Map<number, { weight?: string; units?: string }>
  >(new Map());

  const toggleNewItem = (item: any) => {
    setNewSelections((prev) => {
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
    setNewErrors((prev) => {
      const next = new Map(prev);
      next.delete(item.id);
      return next;
    });
  };

  const updateNewWeight = (
    itemId: number,
    value: number,
    maxAvailableWeight: number,
    maxAvailableUnits: number,
    weightPerUnit: number,
  ) => {
    const calculatedUnits = Math.max(1, Math.round(value / weightPerUnit));

    setNewSelections((prev) => {
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

    setNewErrors((prev) => {
      const next = new Map(prev);
      const finalWeight = calculatedUnits * weightPerUnit;
      const hasWeightError =
        finalWeight < 0.01 || finalWeight > maxAvailableWeight;
      const hasUnitsError =
        calculatedUnits < 1 || calculatedUnits > maxAvailableUnits;

      if (hasWeightError || hasUnitsError) {
        next.set(itemId, {
          ...(hasWeightError
            ? { weight: `Debe ser entre 0.01 y ${maxAvailableWeight} Kg.` }
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

  const updateNewUnits = (
    itemId: number,
    value: number,
    maxAvailableWeight: number,
    maxAvailableUnits: number,
    weightPerUnit: number,
  ) => {
    const calculatedWeight = value * weightPerUnit;

    setNewSelections((prev) => {
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

    setNewErrors((prev) => {
      const next = new Map(prev);
      const hasWeightError =
        calculatedWeight < 0.01 || calculatedWeight > maxAvailableWeight;
      const hasUnitsError = value < 1 || value > maxAvailableUnits;

      if (hasWeightError || hasUnitsError) {
        next.set(itemId, {
          ...(hasWeightError
            ? { weight: `Debe ser entre 0.01 y ${maxAvailableWeight} Kg.` }
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

  const hasNewErrors = useMemo(() => {
    return Array.from(newErrors.values()).some((e) => e.weight || e.units);
  }, [newErrors]);

  return {
    newSelections,
    newErrors,
    toggleNewItem,
    updateNewWeight,
    updateNewUnits,
    hasNewErrors,
  };
}
