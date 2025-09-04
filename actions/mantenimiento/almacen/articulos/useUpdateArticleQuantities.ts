import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IUpdateQuantityData {
  article_id: number;
  new_quantity: number;
}

export const useUpdateArticleQuantities = () => {
  const queryClient = useQueryClient();

  const updateQuantitiesMutation = useMutation({
    mutationKey: ["update-article-quantities"],
    mutationFn: async ({ 
      company,
      location_id, 
      quantities 
    }: { 
      quantities: IUpdateQuantityData[];
      company: string;
      location_id: string;
    }) => {
      await axiosInstance.patch(`/${company}/${location_id}/update-article-quantities`, {
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
    updateQuantities: updateQuantitiesMutation,
  };
};
