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
