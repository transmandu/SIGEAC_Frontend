"use client";

import { useCallback, useState } from "react";

export type CostDraftType = "ARTICLE" | "GENERAL";

type Drafts = Record<number, string>;

const EMPTY: Drafts = {};

/**
 * Costos editados pendientes de guardar, por id y por tipo.
 *
 * Los ids de artículos aeronáuticos y de artículos generales son tablas
 * distintas: un mismo número apunta a registros diferentes, así que cada tipo
 * guarda sus borradores aparte y solo se expone el del tipo activo.
 *
 * No depende de las filas cargadas: con paginación por cursor el usuario
 * cambia de página antes de guardar, y los borradores de las páginas
 * anteriores tienen que seguir contando y guardarse juntos.
 */
export function useCostDrafts(type: CostDraftType) {
  const [byType, setByType] = useState<Record<CostDraftType, Drafts>>({
    ARTICLE: EMPTY,
    GENERAL: EMPTY,
  });

  const drafts = byType[type];

  const onCostChange = useCallback(
    (id: number, value: string) => {
      setByType((all) => {
        const prev = all[type];

        if (!value) {
          if (!(id in prev)) return all;
          const { [id]: _removed, ...rest } = prev;
          return { ...all, [type]: rest };
        }

        if (prev[id] === value) return all;

        return { ...all, [type]: { ...prev, [id]: value } };
      });
    },
    [type],
  );

  const clearDrafts = useCallback(() => {
    setByType((all) => ({ ...all, [type]: EMPTY }));
  }, [type]);

  return {
    drafts,
    onCostChange,
    clearDrafts,
    hasChanges: Object.keys(drafts).length > 0,
  };
}
