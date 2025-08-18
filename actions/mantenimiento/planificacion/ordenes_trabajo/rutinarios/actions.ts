import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { string } from "zod";

export const useUpdateWorkOrderTaskStatus = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      task_id,
      status,
      company,
    }: {
      task_id: string;
      status: string;
      company: string;
    }) => {
      await axiosInstance.put(
        `/${company}/update-status-work-order-task/${task_id}`,
        { status }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Creado!", {
        description: `La tarea ha cerrada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo cerrar la tarea...",
      });
      console.log(error);
    },
  });
  return {
    updateTaskStatus: updateMutation,
  };
};

export const useUpdateWorkOrderTask = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: {
        id: string;
        inspector_responsable?: string;
        technician_responsable?: string;
        total_hours?: string;
      };
      company: string;
    }) => {
      await axiosInstance.put(
        `/${company}/update-work-order-task/${data.id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["work-orders"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Creado!", {
        description: `La tarea ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizada la tarea...",
      });
    },
  });
  return {
    updateWorkOrderTask: updateMutation,
  };
};

export const useAddWorkOrderTask = () => {
  const { selectedCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      work_order_id,
    }: {
      data: {
        task_number: string;
        origin_manual: string;
        description_task: string;
        ata: string;
        status: string;
        task_items?: {
          part_number: string;
          alternate_part_number?: string;
        }[];
      };
      work_order_id: string;
    }) => {
      await axiosInstance.post(
        `/${selectedCompany?.slug}/${work_order_id}/store-work-order-task`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["work-orders"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Creado!", {
        description: `La tarea ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizada la tarea...",
      });
    },
  });
  return {
    addWorkOrderTask: updateMutation,
  };
};

export const useCreateTaskEvents = () => {
  const { selectedCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      task_id,
    }: {
      data: {
        title: string;
        description: string;
        start: string;
        end: string;
      }[];
      task_id: string;
    }) => {
      await axiosInstance.post(
        `/${selectedCompany?.slug}/${task_id}/store-work-order-task-event`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["work-orders"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["work-order"], exact: false });
      toast.success("¡Creado!", {
        description: `La tarea ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizada la tarea...",
      });
    },
  });
  return {
    createTaskEvents: updateMutation,
  };
};
