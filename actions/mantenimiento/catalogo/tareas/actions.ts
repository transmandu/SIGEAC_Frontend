import axiosInstance from "@/lib/axios"
import { CatalogRequirementType, Msg3TaskType } from "@/types/maintenanceCatalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export interface TaskRequirementFormData {
  id?: number;
  requirement_type: CatalogRequirementType;
  part_number?: string;
  description: string;
  quantity?: number | null;
  is_mandatory: boolean;
  notes?: string;
}

export interface TaskFormData {
  task_number?: string;
  ata?: string;
  msg3_type: Msg3TaskType;
  description: string;
  reference?: string;
  requirements: TaskRequirementFormData[];
}

export const useCreateCatalogTask = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      serviceId,
      data,
      company,
    }: {
      serviceId: number | string;
      data: TaskFormData;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/maintenance-catalog-services/${serviceId}/tasks`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service", variables.company, variables.serviceId] });
      toast.success("¡Creada!", { description: "La tarea ha sido registrada correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "No se pudo registrar la tarea..." });
    },
  });

  return { createCatalogTask: createMutation };
};

export const useUpdateCatalogTask = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      serviceId,
      taskId,
      data,
      company,
    }: {
      serviceId: number | string;
      taskId: number | string;
      data: TaskFormData;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/maintenance-catalog-services/${serviceId}/tasks/${taskId}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service", variables.company, variables.serviceId] });
      toast.success("¡Actualizada!", { description: "La tarea ha sido actualizada correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "No se pudo actualizar la tarea..." });
    },
  });

  return { updateCatalogTask: updateMutation };
};

export const useDeleteCatalogTask = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      serviceId,
      taskId,
      company,
    }: {
      serviceId: number | string;
      taskId: number | string;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/maintenance-catalog-services/${serviceId}/tasks/${taskId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service", variables.company, variables.serviceId] });
      toast.success("¡Eliminada!", { description: "La tarea ha sido eliminada correctamente." });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error("Oops!", { description: message || "No se pudo eliminar la tarea..." });
    },
  });

  return { deleteCatalogTask: deleteMutation };
};
