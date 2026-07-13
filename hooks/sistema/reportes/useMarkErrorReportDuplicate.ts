import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMarkErrorReportDuplicate = () => {
  const queryClient = useQueryClient();

  const markDuplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/error-reports/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Marcado!", {
        description: "El reporte fue marcado como duplicado.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo marcar el reporte como duplicado...",
      });
    },
  });

  return { markErrorReportDuplicate: markDuplicateMutation };
};
