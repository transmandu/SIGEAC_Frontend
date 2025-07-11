import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MitigationMeasureData {
  company: string | null;
  data: {
    description: string;
    implementation_supervisor: string;
    implementation_responsible: string;
    estimated_date: Date;
    execution_date?: Date | null;
    mitigation_plan_id: number | string;
  };
}

interface UpdateMitigationMeasureData {
  company: string | null;
  id: string | number;
  data: {
    description: string;
    implementation_supervisor: string;
    implementation_responsible: string;
    estimated_date: Date;
    execution_date?: Date | null;
  };
}
export const useCreateMitigationMeasure = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["mitigation-measures"],
    mutationFn: async ({ data, company }: MitigationMeasureData) => {
      await axiosInstance.post(`/${company}/sms/mitigation-measures`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-measures"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("¡Creado!", {
        description: ` La medida de mitigacion se ha creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la medida de mitigacion...",
      });
      console.log(error);
    },
  });
  return {
    createMitigationMeasure: createMutation,
  };
};

export const useDeleteMitigationMeasure = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      company: string | null;
      id: string;
    }) => {
      await axiosInstance.delete(`/${company}/sms/mitigation-measures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-measures"] });
      toast.success("¡Eliminado!", {
        description: `¡La medida de mitigacion ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la medida de mitigacion!",
      });
    },
  });

  return {
    deleteMitigationMeasure: deleteMutation,
  };
};

export const useUpdateMitigationMeasure = () => {
  const queryClient = useQueryClient();

  const updateMitigationMeasureMutation = useMutation({
    mutationKey: ["mitigation-measures"],
    mutationFn: async ({ data, company, id }: UpdateMitigationMeasureData) => {
      await axiosInstance.patch(
        `/${company}/sms/mitigation-measures/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-measures"] });
      toast.success("¡Actualizado!", {
        description: `La medida de mitigacion ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la medida de mitigacion...",
      });
      console.log(error);
    },
  });
  return {
    updateMitigationMeasure: updateMitigationMeasureMutation,
  };
};
