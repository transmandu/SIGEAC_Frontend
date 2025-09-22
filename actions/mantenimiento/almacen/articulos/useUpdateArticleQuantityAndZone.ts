import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IUpdateArticleData {
  article_id: number;
  new_quantity?: number;
  new_zone?: string;
  justification?: string;
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
      await axiosInstance.patch(`/${company}/update-article-quantities-zones`, {
        updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("¡Actualizado!", {
        description: "Las cantidades y ubicaciones han sido actualizadas correctamente."
      });
    },
    onError: (error) => {
      toast('Hey', {
        description: `No se actualizó correctamente: ${error}`
      })
    },
  });

  return {
    updateArticleQuantityAndZone: updateArticleQuantityAndZoneMutation,
  };
};
