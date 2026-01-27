import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IUpdateArticleData {
  id: number
  newQuantity: number;
}

interface ArticleData {
  article_type?: string;
  description?: string;
  brand_model: string;
  variant_type: string;
  unit_id: string;
  warehouse_id: string;
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


export const useCreateGeneralArticle = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationKey: ["articles"],
    mutationFn: async ({
      data,
      company,
    }: {
      company: string;
      data: ArticleData;
      }) => {
      await axiosInstance.post(`/${company}/general-article`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      toast.success("¡Creado!", {
        description: `El articulo ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el articulo...",
      });
      console.log(error);
    },
  });
  return {
    createGeneralArticle: createMutation,
  };
};
