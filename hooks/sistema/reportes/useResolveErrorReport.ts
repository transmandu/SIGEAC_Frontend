import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ResolveErrorReportData {
  id: number;
  resolution: string;
}

export const useResolveErrorReport = () => {
  const queryClient = useQueryClient();

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution }: ResolveErrorReportData) => {
      const response = await axiosInstance.post(`/error-reports/${id}/resolve`, { resolution });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Resuelto!", {
        description: "El reporte fue marcado como resuelto.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo resolver el reporte...",
      });
    },
  });

  return { resolveErrorReport: resolveMutation };
};
