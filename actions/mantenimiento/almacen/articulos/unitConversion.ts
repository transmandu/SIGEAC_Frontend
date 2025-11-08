import axiosInstance from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface unitConversionData {
  destination_unit_id: number;
  consumable_unit_id: number;
  quantity: number;
}

export const getConvertionArticle = () => {

  const queryClient = useQueryClient()
  const { selectedCompany } = useCompanyStore();
  const createMutation = useMutation({
    mutationFn: async (data: unitConversionData) => {
      const response = await axiosInstance.post(
        `${selectedCompany?.slug}/get-convertion-articles`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("THIS IS DATA FROM POST", data,'se[eracion', response.data);
          return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-article-conversion"] });

    },
    onError: (error) => {
      console.log(error);
    },
  });
  return {
    makeConvertion: createMutation,
  }
}

