import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { DrillMatrixCriterion } from "@/types/sms/drill-evaluation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface DrillMatrixCriterionData {
  criterion: string;
  performance_indicator: string;
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["drill-matrix-criteria"] });
};

export const useCreateDrillMatrixCriterion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: DrillMatrixCriterionData;
    }): Promise<DrillMatrixCriterion> => {
      const response = await axiosInstance.post(
        `/${company}/sms/drill-matrix-criteria`,
        data,
      );

      return response.data;
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("¡Creado!", {
        description: "El criterio se agregó a la matriz de mesa.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el criterio de la matriz" });
    },
  });

  return { createCriterion: mutation };
};

export const useUpdateDrillMatrixCriterion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: number;
      data: DrillMatrixCriterionData;
    }): Promise<DrillMatrixCriterion> => {
      const response = await axiosInstance.patch(
        `/${company}/sms/drill-matrix-criteria/${id}`,
        data,
      );

      return response.data;
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("¡Actualizado!", {
        description: "El criterio se actualizó para las próximas evaluaciones.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el criterio de la matriz" });
    },
  });

  return { updateCriterion: mutation };
};

export const useDeleteDrillMatrixCriterion = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(
        `/${selectedCompany?.slug}/sms/drill-matrix-criteria/${id}`,
      );

      return response.data;
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("¡Eliminado!", {
        description: "El criterio se quitó de la matriz de mesa.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el criterio de la matriz" });
    },
  });

  return { deleteCriterion: mutation };
};

export const useReorderDrillMatrixCriteria = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      ids,
    }: {
      company: string;
      ids: number[];
    }): Promise<DrillMatrixCriterion[]> => {
      const response = await axiosInstance.post(
        `/${company}/sms/drill-matrix-criteria/reorder`,
        { ids },
      );

      return response.data;
    },
    onSuccess: () => {
      invalidate(queryClient);
    },
    onError: (error) => {
      notifyError(error, { action: "reordenar la matriz de mesa" });
    },
  });

  return { reorderCriteria: mutation };
};
