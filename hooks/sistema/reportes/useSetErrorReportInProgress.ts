import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSetErrorReportInProgress = () => {
  const queryClient = useQueryClient();

  const setInProgressMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/error-reports/${id}/in-progress`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Tomado!", {
        description: "El reporte ahora esta en progreso.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo tomar el reporte...",
      });
    },
  });

  return { setErrorReportInProgress: setInProgressMutation };
};
