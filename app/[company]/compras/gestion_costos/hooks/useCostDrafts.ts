"use client";

import { useCallback, useState } from "react";

type DraftValue = string | number | undefined;

/**
 * Costos editados pendientes de guardar, por id.
 *
 * No depende de las filas cargadas: con paginación por cursor el usuario
 * cambia de página antes de guardar, y los borradores de las páginas
 * anteriores tienen que seguir contando y guardarse juntos.
 */
export function useCostDrafts() {
  const [drafts, setDrafts] = useState<Record<number, DraftValue>>({});

  const onCostChange = useCallback((id: number, value: string) => {
    setDrafts((prev) => {
      if (value === "" || value == null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }

      if (prev[id] === value) return prev;

      return {
        ...prev,
        [id]: value,
      };
    });
  }, []);

  return {
    drafts,
    setDrafts,
    onCostChange,
    hasChanges: Object.keys(drafts).length > 0,
  };
}
