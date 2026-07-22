import axiosInstance from "@/lib/axios";
import {
  StoreChangeRequestPayload,
  UpdateChangeRequestPayload,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateChangeRequestData {
  company: string;
  data: StoreChangeRequestPayload;
}

interface UpdateChangeRequestData {
  company: string;
  id: number;
  data: UpdateChangeRequestPayload;
}

export const useCreateChangeRequest = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ data, company }: CreateChangeRequestData) => {
      await axiosInstance.post(`/${company}/sms/change-requests`, data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Creada!", {
        description: "La solicitud de cambio ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la solicitud de cambio...",
      });
      console.error(error);
    },
  });
  return {
    createChangeRequest: createMutation,
  };
};

export const useUpdateChangeRequest = () => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ company, data, id }: UpdateChangeRequestData) => {
      await axiosInstance.patch(
        `/${company}/sms/change-requests/${id}`,
        data
      );
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Actualizada!", {
        description:
          "La solicitud de cambio ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la solicitud de cambio...",
      });
      console.error(error);
    },
  });
  return {
    updateChangeRequest: updateMutation,
  };
};

export const useDeleteChangeRequest = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string;
      id: number;
    }) => {
      await axiosInstance.delete(`/${company}/sms/change-requests/${id}`);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Eliminada!", {
        description:
          "La solicitud de cambio ha sido eliminada correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description:
          "Hubo un error al eliminar la solicitud de cambio...",
      });
    },
  });
  return {
    deleteChangeRequest: deleteMutation,
  };
};
