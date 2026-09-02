import axiosInstance from "@/lib/axios"
import { CatalogRequirementType, Msg3TaskType } from "@/types/maintenanceCatalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/apiErrorMessage";

export interface TaskRequirementFormData {
  id?: number;
  requirement_type: CatalogRequirementType;
  part_number?: string;
  description: string;
  quantity?: number | null;
  unit_id?: number | null;
  is_mandatory: boolean;
  notes?: string;
}

export interface TaskFormData {
  task_number?: string;
  ata?: string;
  msg3_type: Msg3TaskType;
  description: string;
  reference?: string;
  estimated_man_hours?: number | null;
  required_skill?: string;
  requirements: TaskRequirementFormData[];
}

/**
 * Una tarea se ve desde tres lados: el servicio que la contiene, el conteo
 * `tasks_count` del listado de servicios y la lista de tareas del detalle del
 * manual. Los tres quedan viejos si solo se invalida el servicio.
 */
const invalidateTaskScopes = (
  queryClient: ReturnType<typeof useQueryClient>,
  company: string,
  serviceId: number | string,
) => {
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service", company, serviceId] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manual"] });
};

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
      invalidateTaskScopes(queryClient, variables.company, variables.serviceId);
      toast.success("¡Creada!", { description: "La tarea ha sido registrada correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo registrar la tarea...") });
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
      invalidateTaskScopes(queryClient, variables.company, variables.serviceId);
      toast.success("¡Actualizada!", { description: "La tarea ha sido actualizada correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo actualizar la tarea...") });
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
      invalidateTaskScopes(queryClient, variables.company, variables.serviceId);
      toast.success("¡Eliminada!", { description: "La tarea ha sido eliminada correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo eliminar la tarea...") });
    },
  });

  return { deleteCatalogTask: deleteMutation };
};
