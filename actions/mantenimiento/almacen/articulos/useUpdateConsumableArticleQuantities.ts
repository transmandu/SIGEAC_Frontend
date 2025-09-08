import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IUpdateQuantityData {
  article_id: number;
  new_quantity: number;
}

export const useUpdateConsumableArticleQuantities = () => {
  const queryClient = useQueryClient();

  const updateConsumableQuantitiesMutation = useMutation({
    mutationKey: ["update-article-quantities"],
    mutationFn: async ({ 
      company, 
      quantities 
    }: { 
      quantities: IUpdateQuantityData[];
      company: string;
    }) => {
      await axiosInstance.patch(`/${company}/update-consumable-article-quantities`, {
        quantities,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("¡Actualizado!", {
        description: "Las cantidades han sido actualizadas correctamente."
      });
    },
    onError: (error) => {
      toast('Hey', {
        description: `No se creo correctamente: ${error}`
      })
    },
  });

  return {
    updateQuantities: updateConsumableQuantitiesMutation,
  };
};
