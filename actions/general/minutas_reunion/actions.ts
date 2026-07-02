import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MinuteMutationData {
  company: string;
  id?: number;
  data: FormData;
}

export const useCreateMeetingMinute = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, data }: MinuteMutationData) => {
      await axiosInstance.post(`/${company}/meetings`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-minutes"] });
      toast.success("¡Creada!", {
        description: "La minuta de reunión se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la minuta de reunión.",
      });
      console.error(error);
    },
  });

  return { createMeetingMinute: mutation };
};

export const useUpdateMeetingMinute = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id, data }: MinuteMutationData) => {
      await axiosInstance.post(`/${company}/meetings/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-minutes"] });
      toast.success("¡Actualizada!", {
        description: "La minuta de reunión se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la minuta de reunión.",
      });
      console.error(error);
    },
  });

  return { updateMeetingMinute: mutation };
};

export const useDeleteMeetingMinute = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      await axiosInstance.delete(`/${company}/meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-minutes"] });
      toast.success("¡Eliminada!", {
        description: "La minuta de reunión se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo eliminar la minuta de reunión.",
      });
      console.error(error);
    },
  });

  return { deleteMeetingMinute: mutation };
};
