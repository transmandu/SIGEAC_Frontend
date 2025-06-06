import axiosInstance from "@/lib/axios";
import { Analysis } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AnalysesData {
  probability: string;
  severity: string;
  result: string;
  mitigation_plan_id?: string;
  danger_identification_id?: string;
}

export const useCreateAnalysis = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["analysis"],
    mutationFn: async (data: AnalysesData) => {
      await axiosInstance.post("/transmandu/sms/analysis", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({ queryKey: ["danger-identifications"] });
      queryClient.invalidateQueries({ queryKey: ["danger-identification-by-id"] });
      toast.success("¡Creado!", {
        description: ` El análisis ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el análisis...",
      });
      console.log(error);
    },
  });
  return {
    createAnalysis: createMutation,
  };
};

export const useDeleteAnalysis = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/transmandu/sms/analysis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("¡Eliminado!", {
        description: `¡El analisis ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar un analisis!",
      });
    },
  });

  return {
    deleteAnalysis: deleteMutation,
  };
};

export const useUpdateAnalyses = () => {
  const queryClient = useQueryClient();
  const updateAnalysesMutation = useMutation({
    mutationKey: ["analysis"],
    mutationFn: async (data: Analysis) => {
      await axiosInstance.put(`/transmandu/sms/analysis/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({ queryKey: ["danger-identifications"] });
      toast.success("¡Actualizado!", {
        description: `El analisis ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el analisis...",
      });
      console.log(error);
    },
  });
  return {
    updateAnalyses: updateAnalysesMutation,
  };
};
