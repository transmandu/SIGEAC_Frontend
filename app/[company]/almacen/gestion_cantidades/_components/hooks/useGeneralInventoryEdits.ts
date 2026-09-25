"use client";

import { useCallback, useMemo, useState } from "react";
import type { WarehouseInventoryGeneralArticle } from "@/types/inventory";

type EditedState = Record<number, number | undefined>;

/**
 * Cantidades editadas pendientes de guardar.
 *
 * Las bases se acumulan por id a medida que se ven artículos: con paginación
 * por cursor lo editado en una página tiene que seguir contando al pasar a
 * otra, y calcular los cambios solo contra las filas visibles lo perdía.
 */
export function useGeneralInventoryEdits(
  articles: WarehouseInventoryGeneralArticle[],
) {
  const [baseQuantities, setBaseQuantities] = useState<Record<number, number>>(
    {},
  );
  const [editedQuantities, setEditedQuantities] = useState<EditedState>({});

  const unseen = articles.filter((article) => !(article.id in baseQuantities));
  if (unseen.length > 0) {
    setBaseQuantities((prev) => {
      const next = { ...prev };
      for (const article of unseen)
        next[article.id] ??= Number(article.quantity ?? 0);
      return next;
    });
  }

  const setQuantity = useCallback((id: number, value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");

    setEditedQuantities((prev) => {
      const next = { ...prev };

      if (cleaned === "") {
        delete next[id];
        return next;
      }

      next[id] = Math.max(0, Number(cleaned));
      return next;
    });
  }, []);

  const modified = useMemo(() => {
    const changes: Array<{ id: number; newQuantity: number }> = [];

    for (const [key, edited] of Object.entries(editedQuantities)) {
      const id = Number(key);
      const base = baseQuantities[id];
      if (edited === undefined || base === undefined) continue;

      const next = Math.max(0, Math.trunc(edited));
      if (next !== base) changes.push({ id, newQuantity: next });
    }

    return changes;
  }, [baseQuantities, editedQuantities]);

  /** Lo guardado pasa a ser la base, sin esperar al listado nuevo. */
  const commit = useCallback(() => {
    setBaseQuantities((prev) => {
      const next = { ...prev };
      for (const change of modified) next[change.id] = change.newQuantity;
      return next;
    });
    setEditedQuantities({});
  }, [modified]);

  return {
    state: {
      editedQuantities,
      baseQuantities,
      hasChanges: modified.length > 0,
    },
    actions: { setQuantity, commit },
    utils: { modified, modifiedCount: modified.length },
  };
}
