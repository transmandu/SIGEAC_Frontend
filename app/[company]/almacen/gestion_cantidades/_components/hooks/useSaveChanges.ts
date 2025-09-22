import { useCallback } from "react";
import { toast } from "sonner";
import { useUpdateArticleQuantityAndZone } from "@/actions/mantenimiento/almacen/articulos/useUpdateArticleQuantityAndZone";
import { ModifiedArticle } from "./useArticleChanges";
import { TOAST_MESSAGES } from "../constants";

// API types
export interface UpdateArticlePayload {
  article_id: number;
  new_quantity?: number;
  new_zone?: string;
  justification: string;
}

interface UseSaveChangesProps {
  getModifiedArticles: () => ModifiedArticle[];
  articlesWithoutJustificationCount: number;
  companySlug: string;
}

export const useSaveChanges = ({
  getModifiedArticles,
  articlesWithoutJustificationCount,
  companySlug,
}: UseSaveChangesProps) => {
  const { updateArticleQuantityAndZone } = useUpdateArticleQuantityAndZone();

  const handleSave = useCallback(() => {
    const modifiedEntries = getModifiedArticles();

    // Validation: Check if there are changes
    if (modifiedEntries.length === 0) {
      toast.info(TOAST_MESSAGES.NO_CHANGES);
      return;
    }

    // Validation: Check if all changes have justification
    if (articlesWithoutJustificationCount > 0) {
      toast.error(TOAST_MESSAGES.JUSTIFICATION_REQUIRED, {
        description: `${articlesWithoutJustificationCount} artículo(s) necesitan justificación.`
      });
      return;
    }

    // Build request payload
    const requestPayload = {
      updates: modifiedEntries.map((entry): UpdateArticlePayload => ({
        article_id: entry.articleId,
        ...(entry.quantityChanged && { new_quantity: entry.newQuantity }),
        ...(entry.zoneChanged && { new_zone: entry.newZone }),
        justification: entry.justification,
      })),
      company: companySlug,
    };

    // Log for development/testing
    logSaveData(modifiedEntries, requestPayload);

    // Send to backend (currently commented for testing)
    // updateArticleQuantityAndZone.mutate(requestPayload);
  }, [getModifiedArticles, articlesWithoutJustificationCount, companySlug, updateArticleQuantityAndZone]);

  return {
    handleSave,
    isSaving: updateArticleQuantityAndZone.isPending,
  };
};

// Helper function for development logging
const logSaveData = (modifiedEntries: ModifiedArticle[], requestPayload: any) => {
  console.log("📦 Datos que se enviarían al backend:");
  console.log("🔄 Artículos modificados:", modifiedEntries);
  console.log("📤 Payload completo:", JSON.stringify(requestPayload, null, 2));
  console.log("📋 Resumen:", {
    totalArticulosModificados: modifiedEntries.length,
    conCambiosDeCantidad: modifiedEntries.filter(e => e.quantityChanged).length,
    conCambiosDeZona: modifiedEntries.filter(e => e.zoneChanged).length,
    conJustificacion: modifiedEntries.filter(e => e.hasValidJustification).length
  });
};
