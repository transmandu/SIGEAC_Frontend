import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteErrorReport = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/error-reports/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Eliminado!", {
        description: "El reporte fue eliminado.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo eliminar el reporte...",
      });
    },
  });

  return { deleteErrorReport: deleteMutation };
};
