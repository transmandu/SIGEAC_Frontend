import axiosInstance from "@/lib/axios";
import { ErrorReportSeverity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getCreateErrorReportMessage = (error: unknown) => {
  const maybeAxiosError = error as {
    response?: {
      status?: number;
      data?: { message?: string; errors?: Record<string, string[]> };
    };
  };
  const errors = maybeAxiosError.response?.data?.errors;
  const firstValidationMessage = errors
    ? Object.values(errors)[0]?.[0]
    : undefined;
  return (
    firstValidationMessage ||
    maybeAxiosError.response?.data?.message ||
    "No se pudo registrar el reporte..."
  );
};

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
    onError: (error) => {
      toast.error("Oops!", {
        description: getCreateErrorReportMessage(error),
      });
    },
  });

  return { createErrorReport: createMutation };
};
