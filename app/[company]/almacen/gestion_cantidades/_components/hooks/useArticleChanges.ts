import { useCallback, useMemo, useState } from "react";
import type { StockAdjustmentBatch } from "@/types/inventory";

export interface ModifiedArticle {
  articleId: number;
  newQuantity: number;
  newZone: string;
  quantityChanged: boolean;
  zoneChanged: boolean;
}

type Original = { quantity: number; zone: string };

/**
 * Cambios de cantidad y ubicación pendientes de guardar.
 *
 * Solo se guarda lo editado, por id, y los valores originales de cada artículo
 * visto: con paginación por cursor el usuario cambia de página antes de
 * guardar, y reconstruir el estado a partir de los renglones visibles —como se
 * hacía— borraba lo editado en las páginas anteriores.
 */
export const useArticleChanges = (batches: StockAdjustmentBatch[]) => {
  const [originals, setOriginals] = useState<Record<number, Original>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [zones, setZones] = useState<Record<number, string>>({});

  // Los originales se registran la primera vez que se ve cada artículo. Se
  // hace durante el render, con guarda, para que la fila ya se compare contra
  // su original en esta misma pasada.
  const unseen = batches
    .flatMap((batch) => batch.articles)
    .filter((article) => !(article.id in originals));

  if (unseen.length > 0) {
    setOriginals((prev) => {
      const next = { ...prev };
      for (const article of unseen) {
        next[article.id] ??= {
          quantity: Number(article.quantity ?? 0),
          zone: article.zone ?? "",
        };
      }
      return next;
    });
  }

  const handleQuantityChange = useCallback(
    (articleId: number, newQuantity: string) => {
      const numQuantity = parseFloat(newQuantity) || 0;

      if (numQuantity < 0) return;

      setQuantities((prev) => ({ ...prev, [articleId]: numQuantity }));
    },
    [],
  );

  const handleZoneChange = useCallback((articleId: number, newZone: string) => {
    setZones((prev) => ({ ...prev, [articleId]: newZone }));
  }, []);

  const modifiedArticles = useMemo<ModifiedArticle[]>(() => {
    const ids = new Set(
      [...Object.keys(quantities), ...Object.keys(zones)].map(Number),
    );
    const result: ModifiedArticle[] = [];

    ids.forEach((articleId) => {
      const original = originals[articleId];
      if (!original) return;

      const newQuantity = quantities[articleId] ?? original.quantity;
      const newZone = zones[articleId] ?? original.zone;
      const quantityChanged = newQuantity !== original.quantity;
      const zoneChanged = newZone !== original.zone;

      if (quantityChanged || zoneChanged) {
        result.push({
          articleId,
          newQuantity,
          newZone,
          quantityChanged,
          zoneChanged,
        });
      }
    });

    return result;
  }, [originals, quantities, zones]);

  /**
   * Tras guardar, lo guardado pasa a ser el original. Se fija aquí y no se
   * espera al listado nuevo: hasta que llegue, en pantalla siguen las filas
   * viejas y volverían a registrarse como originales.
   */
  const commitChanges = useCallback(() => {
    setOriginals((prev) => {
      const next = { ...prev };
      for (const change of modifiedArticles) {
        next[change.articleId] = {
          quantity: change.newQuantity,
          zone: change.newZone,
        };
      }
      return next;
    });
    setQuantities({});
    setZones({});
  }, [modifiedArticles]);

  return {
    state: {
      quantities,
      zones,
      hasChanges: modifiedArticles.length > 0,
    },
    actions: {
      handleQuantityChange,
      handleZoneChange,
      commitChanges,
    },
    utils: {
      getModifiedArticles: () => modifiedArticles,
      modifiedCount: modifiedArticles.length,
    },
  };
};
