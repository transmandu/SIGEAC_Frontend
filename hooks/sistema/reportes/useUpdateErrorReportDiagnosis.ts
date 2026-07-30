import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateErrorReportDiagnosisData {
  id: number;
  http_status?: number;
  technical_cause?: string;
  diagnostic_steps?: string[];
}

export const useUpdateErrorReportDiagnosis = () => {
  const queryClient = useQueryClient();

  const updateDiagnosisMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateErrorReportDiagnosisData) => {
      const response = await axiosInstance.patch(`/error-reports/${id}/diagnosis`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Diagnóstico actualizado!", {
        description: "El diagnóstico técnico fue guardado correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el diagnóstico...",
      });
    },
  });

  return { updateErrorReportDiagnosis: updateDiagnosisMutation };
};
