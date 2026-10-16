import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Condition } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ConditionPayload {
  name: string;
  description: string;
  /** Lo que sale en esta condición se informa en los reportes pero no suma al costo. */
  excluded_from_cost: boolean;
}

export const useCreateCondition = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const createMutation = useMutation({
    mutationFn: async (data: ConditionPayload): Promise<Condition> => {
      const response = await axiosInstance.post(
        `/${slug}/condition-article`,
        data,
      );
      return response.data.Condition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conditions", slug] });
      toast.success("¡Creada!", {
        description: "La condición ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "No se pudo crear la condición."),
      });
    },
  });

  return {
    createCondition: createMutation,
  };
};

export const useUpdateCondition = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      /** Actualización parcial: solo viajan los campos que cambiaron. */
      data: Partial<ConditionPayload>;
    }) => {
      await axiosInstance.put(`/${slug}/condition-article/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conditions", slug] });
      toast.success("¡Actualizada!", {
        description: "La condición ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "¡Hubo un error al actualizar la condición!",
        ),
      });
    },
  });

  return {
    updateCondition: updateMutation,
  };
};

export const useDeleteCondition = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${slug}/condition-article/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conditions", slug] });
      toast.success("¡Eliminada!", {
        description: "La condición ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      // 409/422: la condición tiene salidas o artículos y no puede borrarse;
      // el motivo viene en el mensaje del servidor.
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "¡Hubo un error al eliminar la condición!",
        ),
      });
    },
  });

  return {
    deleteCondition: deleteMutation,
  };
};
