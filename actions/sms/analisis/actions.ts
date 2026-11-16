import axiosInstance from "@/lib/axios";
import { Analysis } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

interface AnalysesData {
  company: string | null;
  data: {
    probability: string;
    severity: string;
    result: string;
    mitigation_plan_id?: string;
    danger_identification_id?: string;
  };
}

interface UpdateAnalysisData {
  company: string | null;
  id: string;
  data: {
    probability: string;
    severity: string;
    result: string;
  };
}

export const useCreateAnalysis = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["analysis"],
    mutationFn: async ({ data, company }: AnalysesData) => {
      await axiosInstance.post(`/${company}/sms/analysis`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({
        queryKey: ["danger-identifications", data.company],
      });
      queryClient.invalidateQueries({
        queryKey: ["danger-identification"],
      });
      toast.success("¡Creado!", {
        description: ` El análisis ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el análisis" });
      console.log(error);
    },
  });
  return {
    createAnalysis: createMutation,
  };
};

export const useUpdateAnalyses = () => {
  const queryClient = useQueryClient();
  const updateAnalysesMutation = useMutation({
    mutationKey: ["analysis"],
    mutationFn: async ({ company, data, id }: UpdateAnalysisData) => {
      await axiosInstance.patch(`/${company}/sms/analysis/${id}`, data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({
        queryKey: ["danger-identifications", data.company],
      });
      toast.success("¡Actualizado!", {
        description: `El analisis ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el analisis" });
      console.log(error);
    },
  });
  return {
    updateAnalyses: updateAnalysesMutation,
  };
};
