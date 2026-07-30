import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddErrorReportImagesData {
  id: number;
  images: File[];
}

export const useAddErrorReportImages = () => {
  const queryClient = useQueryClient();

  const addImagesMutation = useMutation({
    mutationFn: async ({ id, images }: AddErrorReportImagesData) => {
      const formData = new FormData();
      images.forEach((image) => formData.append("images[]", image));

      const response = await axiosInstance.post(`/error-reports/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Imágenes agregadas!", {
        description: "Las imágenes fueron adjuntadas al reporte.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudieron agregar las imágenes...",
      });
    },
  });

  return { addErrorReportImages: addImagesMutation };
};
