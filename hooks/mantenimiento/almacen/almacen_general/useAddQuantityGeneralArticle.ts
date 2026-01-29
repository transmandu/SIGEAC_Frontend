import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { toast } from "sonner";

export interface IAddQuantityGeneralArticle {
  id: number;
  quantity: number;
}

export const useAddQuantityGeneralArticle = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  const mutation = useMutation({
    mutationKey: ["add-quantity-general-article"],
    mutationFn: async ({ id, quantity }: IAddQuantityGeneralArticle) => {
      if (!selectedCompany?.slug) throw new Error("No hay compañía seleccionada");
      await axiosInstance.patch(
        `/${selectedCompany.slug}/add-quantity-general-article/${id}`,
        { quantity }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      toast.success("¡Cantidad actualizada!", {
        description: "La cantidad del artículo se actualizó correctamente.",
      });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message ||
          "No se pudo actualizar la cantidad del artículo.",
      });
      console.error(error);
    },
  });

  return { addQuantityGeneralArticle: mutation };
};
