import axiosInstance from "@/lib/axios";
import { ErrorReportSeverity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateErrorReportData {
  description: string;
  module?: string;
  severity?: ErrorReportSeverity;
  http_status?: number;
  images?: File[];
}

export const useCreateErrorReport = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ images, ...data }: CreateErrorReportData) => {
      if (images && images.length > 0) {
        const formData = new FormData();
        formData.append("description", data.description);
        if (data.module) formData.append("module", data.module);
        if (data.severity) formData.append("severity", data.severity);
        if (data.http_status !== undefined) formData.append("http_status", String(data.http_status));
        images.forEach((image) => formData.append("images[]", image));

        const response = await axiosInstance.post("/error-reports", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }

      const response = await axiosInstance.post("/error-reports", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Reporte enviado!", {
        description: "Tu reporte fue registrado correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo registrar el reporte...",
      });
    },
  });

  return { createErrorReport: createMutation };
};
