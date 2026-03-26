import axiosInstance from "@/lib/axios";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface event {
  title: string;
  start: string;
  end: string;
  description?: string;
}
interface CreateWOData {
  description: string;
  elaborated_by: string;
  reviewed_by: string;
  approved_by: string;
  date: string;
  aircraft_id: string;
  location_id: string;
  client_id?: number;
  client_name?: string;
  authorizing?: "PROPIETARIO" | "EXPLOTADOR";
  work_order_task?: {
    description_task: string;
    ata: string;
  }[];
}

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
      eventId,
    }: {
      data: CreateWOData;
      company: string;
      eventId?: string;
    }) => {
      const payload = {
        ...data,
        eventId: eventId,
      };

      await axiosInstance.post(`/${company}/work-orders`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["work-orders"],
        exact: false,
      });
      toast.success("¡Creado!", {
        description: `La orden de trabajo ha sido registrado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo registrar la orden de trabajo...",
      });
      console.log(error);
    },
  });
  return {
    createWorkOrder: createMutation,
  };
};

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number | string;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/work-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["work-orders"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Eliminado!", {
        description: `¡La orden de trabajo ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la orden de trabajo!",
      });
    },
  });

  return {
    deleteWorkOrder: deleteMutation,
  };
};

// ─────────────────────────────────────────────────────
// UPDATE WORK ORDER (campos principales)
// ─────────────────────────────────────────────────────
interface UpdateWOData {
  description?: string;
  elaborated_by?: string;
  reviewed_by?: string;
  approved_by?: string;
  date?: string;
  aircraft_id?: string;
  document?: File;
}

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number | string;
      data: UpdateWOData;
      company: string;
    }) => {
      await axiosInstance.post(
          `/${company}/work-orders/${id}`,
          { ...data, _method: 'PUT' }, 
          {
              headers: {
                  'Content-Type': 'multipart/form-data', 
              },
          }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Actualizado!", {
        description: `La orden de trabajo ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la orden de trabajo...",
      });
      console.log(error);
    },
  });

  return { updateWorkOrder: updateMutation };
};

// ─────────────────────────────────────────────────────
// UPDATE WORK ORDER TASK (editar tarea individual)
// ─────────────────────────────────────────────────────
interface UpdateWOTaskData {
  description_task?: string;
  ata?: string;
  material?: string | null;
}

export const useUpdateWorkOrderTask = () => {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number | string;
      data: UpdateWOTaskData;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/update-work-order-task/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"], exact: false });
    },
    onError: (error) => {
      toast.error("Oops!", { description: "No se pudo actualizar la tarea..." });
      console.log(error);
    },
  });

  return { updateWorkOrderTask: updateTaskMutation };
};

// ─────────────────────────────────────────────────────
// DELETE WORK ORDER TASK (eliminar tarea)
// ─────────────────────────────────────────────────────
export const useDeleteWorkOrderTask = () => {
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number | string;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/work-order-tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"], exact: false });
      toast.success("¡Eliminada!", {
        description: "La tarea ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", { description: "No se pudo eliminar la tarea..." });
      console.log(error);
    },
  });

  return { deleteWorkOrderTask: deleteTaskMutation };
};

// ─────────────────────────────────────────────────────
// ADD WORK ORDER TASK (agregar tarea nueva a orden existente)
// ─────────────────────────────────────────────────────
interface AddWOTaskData {
  description_task: string;
  ata: string;
  material?: string | null;
  task_items?: { part_number: string; alternate_part_number?: string }[];
}

export const useAddWorkOrderTask = () => {
  const queryClient = useQueryClient();

  const addTaskMutation = useMutation({
    mutationFn: async ({
      work_order_id,
      data,
      company,
    }: {
      work_order_id: number | string;
      data: AddWOTaskData;
      company: string;
    }) => {
      await axiosInstance.post(
        `/${company}/${work_order_id}/store-work-order-task`,
        {
          ...data,
          task_items: data.task_items ?? [],
          task_number: "N/A",
          origin_manual: null,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"], exact: false });
    },
    onError: (error) => {
      toast.error("Oops!", { description: "No se pudo agregar la tarea..." });
      console.log(error);
    },
  });

  return { addWorkOrderTask: addTaskMutation };
};

// Agrega esta interfaz y este hook NUEVO al final del archivo actions.ts

export const useCloseWorkOrder = () => {
  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number | string;
      company: string;
    }) => {
      // Usamos PATCH solo para cambiar el status
      await axiosInstance.patch(`/${company}/work-orders/${id}`, {
        status: "CERRADO",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Orden cerrada!", {
        description: "La orden de trabajo ha sido cerrada correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo cerrar la orden de trabajo.",
      });
    },
  });

  return { closeWorkOrder: closeMutation };
};
