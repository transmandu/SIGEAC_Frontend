import { useCallback, useEffect, useMemo, useState } from "react";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";

export interface ArticleChanges {
  quantities: Record<number, number>;
  zones: Record<number, string>;
  hasChanges: boolean;
}

export interface ArticleChangeActions {
  handleQuantityChange: (articleId: number, newQuantity: string) => void;
  handleZoneChange: (articleId: number, newZone: string) => void;
  resetChanges: () => void;
}

export interface ModifiedArticle {
  articleId: number;
  newQuantity: number;
  newZone: string;
  quantityChanged: boolean;
  zoneChanged: boolean;
}

export const useArticleChanges = (batches: IWarehouseArticle[] | undefined) => {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [zones, setZones] = useState<Record<number, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize quantities and zones when articles are loaded
  useEffect(() => {
    if (batches && Array.isArray(batches)) {
      const initialQuantities: Record<number, number> = {};
      const initialZones: Record<number, string> = {};
      batches.forEach((batch) => {
        if (batch && batch.articles && Array.isArray(batch.articles)) {
          batch.articles.forEach((article) => {
            initialQuantities[article.id] = article.quantity || 0;
            initialZones[article.id] = article.zone;
          });
        }
      });
      setQuantities(initialQuantities);
      setZones(initialZones);
    }
  }, [batches]);

  const handleQuantityChange = useCallback(
    (articleId: number, newQuantity: string) => {
      const numQuantity = parseFloat(newQuantity) || 0;

      // No permitir valores negativos
      if (numQuantity < 0) return;

      setQuantities((prev) => ({
        ...prev,
        [articleId]: numQuantity,
      }));
      setHasChanges(true);
    },
    []
  );

  const handleZoneChange = useCallback(
    (articleId: number, newZone: string) => {
      setZones((prev) => ({
        ...prev,
        [articleId]: newZone,
      }));
      setHasChanges(true);
    },
    []
  );

  const resetChanges = useCallback(() => {
    setHasChanges(false);
    if (batches && Array.isArray(batches)) {
      const initialQuantities: Record<number, number> = {};
      const initialZones: Record<number, string> = {};
      batches.forEach((batch) => {
        if (batch && batch.articles && Array.isArray(batch.articles)) {
          batch.articles.forEach((article) => {
            initialQuantities[article.id] = article.quantity || 0;
            initialZones[article.id] = article.zone;
          });
        }
      });
      setQuantities(initialQuantities);
      setZones(initialZones);
    }
  }, [batches]);

  // Función para obtener artículos modificados
  const getModifiedArticles = useCallback((): ModifiedArticle[] => {
    const modifiedArticles: ModifiedArticle[] = [];

    if (!batches || !Array.isArray(batches)) {
      return modifiedArticles;
    }

    batches.forEach((batch) => {
      if (!batch || !batch.articles || !Array.isArray(batch.articles)) {
        return;
      }
      
      batch.articles.forEach((article) => {
        const currentQuantity = quantities[article.id] ?? article.quantity;
        const currentZone = zones[article.id] ?? article.zone;
        
        const quantityChanged = currentQuantity !== (article.quantity || 0);
        const zoneChanged = currentZone !== article.zone;

        if (quantityChanged || zoneChanged) {
          modifiedArticles.push({
            articleId: article.id,
            newQuantity: currentQuantity,
            newZone: currentZone,
            quantityChanged,
            zoneChanged,
          });
        }
      });
    });

    return modifiedArticles;
  }, [quantities, zones, batches]);

  // Número de artículos modificados
  const modifiedCount = useMemo(
    () => getModifiedArticles().length,
    [getModifiedArticles]
  );

  return {
    state: {
      quantities,
      zones,
      hasChanges,
    },
    actions: {
      handleQuantityChange,
      handleZoneChange,
      resetChanges,
    },
    utils: {
      getModifiedArticles,
      modifiedCount,
    },
  };
};
