import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IUpdateArticleData {
  id: number
  newQuantity: number;
}

export const useUpdateGeneralArticleQuantity = () => {
  const queryClient = useQueryClient();
  const {selectedCompany} = useCompanyStore();
  const updateGeneralArticleQuantity = useMutation({
    mutationKey: ["article-general-quantity"],
    mutationFn: async ({
      updates
    }: {
      updates: IUpdateArticleData[];
    }) => {
      await axiosInstance.patch(`/${selectedCompany?.slug}/article-general-quantity`, {
        updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      toast.success("¡Actualizado!", {
        description: "Las cantidades han sido actualizadas correctamente."
      });
    },
    onError: (error) => {
      toast('Hey', {
        description: `No se actualizó correctamente: ${error}`
      })
    },
  });

  return {
    updateGeneralArticleQuantity: updateGeneralArticleQuantity,
  };
};
