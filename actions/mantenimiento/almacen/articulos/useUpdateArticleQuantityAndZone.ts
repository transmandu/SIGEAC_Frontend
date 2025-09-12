import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IUpdateArticleData {
  article_id: number;
  new_quantity?: number;
  new_zone?: string;
}

export const useUpdateArticleQuantityAndZone = () => {
  const queryClient = useQueryClient();

  const updateArticleQuantityAndZoneMutation = useMutation({
    mutationKey: ["update-article-quantity-zone"],
    mutationFn: async ({ 
      company, 
      updates 
    }: { 
      updates: IUpdateArticleData[];
      company: string;
    }) => {
      // Use the existing update-article-warehouse endpoint for each article
      const promises = updates.map(async (update) => {
        const updateData: any = {};
        
        if (update.new_quantity !== undefined) {
          updateData.quantity = update.new_quantity;
        }
        
        if (update.new_zone !== undefined) {
          updateData.zone = update.new_zone;
        }

        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          return await axiosInstance.post(
            `/${company}/update-article-warehouse/${update.article_id}`, 
            updateData
          );
        }
      });

      await Promise.all(promises.filter(Boolean));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("¡Actualizado!", {
        description: "Los artículos han sido actualizados correctamente."
      });
    },
    onError: (error) => {
      toast.error('Error', {
        description: `No se pudieron actualizar los artículos: ${error}`
      });
    },
  });

  return {
    updateArticleQuantityAndZone: updateArticleQuantityAndZoneMutation,
  };
};
