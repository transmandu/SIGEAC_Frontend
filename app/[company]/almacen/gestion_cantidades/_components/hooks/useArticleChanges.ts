import { useCallback, useEffect, useMemo, useState } from "react";
import { IWarehouseArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseConsumableArticles";
import { VALIDATION } from "../constants";

// Base types
export type Article = IWarehouseArticle["articles"][0];
export type Batch = IWarehouseArticle;

// State types
export interface ArticleChangeState {
  quantities: Record<number, number>;
  zones: Record<number, string>;
  justifications: Record<number, string>;
  hasChanges: boolean;
}

export interface ModifiedArticle {
  articleId: number;
  newQuantity: number;
  newZone: string;
  justification: string;
  quantityChanged: boolean;
  zoneChanged: boolean;
  hasValidJustification: boolean;
}

export const useArticleChanges = (batches: Batch[] | undefined) => {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [zones, setZones] = useState<Record<number, string>>({});
  const [justifications, setJustifications] = useState<Record<number, string>>({});

  // Initialize state when batches load
  const initializeState = useCallback(() => {
    if (!batches?.length) return;
    
    const initialQuantities: Record<number, number> = {};
    const initialZones: Record<number, string> = {};
    const initialJustifications: Record<number, string> = {};
    
    batches.forEach((batch) => {
      batch.articles?.forEach((article) => {
        initialQuantities[article.id] = article.quantity || 0;
        initialZones[article.id] = article.zone;
        initialJustifications[article.id] = "";
      });
    });
    
    setQuantities(initialQuantities);
    setZones(initialZones);
    setJustifications(initialJustifications);
  }, [batches]);

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  const handleQuantityChange = useCallback((articleId: number, newQuantity: string) => {
    const numQuantity = Math.max(VALIDATION.MIN_QUANTITY, parseFloat(newQuantity) || 0);
    setQuantities(prev => ({ ...prev, [articleId]: numQuantity }));
  }, []);

  const handleZoneChange = useCallback((articleId: number, newZone: string) => {
    setZones(prev => ({ ...prev, [articleId]: newZone }));
  }, []);

  const handleJustificationChange = useCallback((articleId: number, justification: string) => {
    setJustifications(prev => ({ ...prev, [articleId]: justification }));
  }, []);

  const resetChanges = useCallback(() => {
    initializeState();
  }, [initializeState]);

  // Get modified articles with validation
  const getModifiedArticles = useCallback((): ModifiedArticle[] => {
    if (!batches?.length) return [];

    const modifiedArticles: ModifiedArticle[] = [];
    
    batches.forEach((batch) => {
      batch.articles?.forEach((article) => {
        const currentQuantity = quantities[article.id] ?? article.quantity;
        const currentZone = zones[article.id] ?? article.zone;
        const currentJustification = justifications[article.id] ?? "";
        
        const quantityChanged = currentQuantity !== (article.quantity || 0);
        const zoneChanged = currentZone !== article.zone;
        const hasChanges = quantityChanged || zoneChanged;

        if (hasChanges) {
          modifiedArticles.push({
            articleId: article.id,
            newQuantity: currentQuantity,
            newZone: currentZone,
            justification: currentJustification.trim(),
            quantityChanged,
            zoneChanged,
            hasValidJustification: currentJustification.trim().length >= VALIDATION.MIN_JUSTIFICATION_LENGTH,
          });
        }
      });
    });

    return modifiedArticles;
  }, [quantities, zones, justifications, batches]);

  // Computed values
  const modifiedArticles = useMemo(() => getModifiedArticles(), [getModifiedArticles]);
  const modifiedCount = modifiedArticles.length;
  const articlesWithoutJustificationCount = modifiedArticles.filter(a => !a.hasValidJustification).length;
  const hasChanges = modifiedCount > 0;
  const canSave = modifiedCount > 0 && articlesWithoutJustificationCount === 0;

  return {
    state: { quantities, zones, justifications, hasChanges },
    actions: { handleQuantityChange, handleZoneChange, handleJustificationChange, resetChanges },
    utils: { getModifiedArticles, modifiedCount, articlesWithoutJustificationCount, canSave },
  };
};

