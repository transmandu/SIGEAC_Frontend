import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteErrorReportImageData {
  id: number;
  imageId: number;
}

export const useDeleteErrorReportImage = () => {
  const queryClient = useQueryClient();

  const deleteImageMutation = useMutation({
    mutationFn: async ({ id, imageId }: DeleteErrorReportImageData) => {
      const response = await axiosInstance.delete(`/error-reports/${id}/images/${imageId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Imagen eliminada!", {
        description: "La imagen fue eliminada del reporte.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo eliminar la imagen...",
      });
    },
  });

  return { deleteErrorReportImage: deleteImageMutation };
};
