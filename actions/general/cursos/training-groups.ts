import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

export interface SmsTrainingGroupPayload {
  name: string;
  description?: string;
  job_title_ids: number[];
}

interface CreateSmsTrainingGroupData {
  company: string;
  data: SmsTrainingGroupPayload;
}

interface UpdateSmsTrainingGroupData extends CreateSmsTrainingGroupData {
  id: number;
}

export const useCreateSmsTrainingGroup = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ company, data }: CreateSmsTrainingGroupData) => {
      const response = await axiosInstance.post(
        `/general/${company}/sms-training-groups`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-groups", company],
      });
      toast.success("¡Creado!", {
        description: "El grupo de capacitación ha sido creado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el grupo de capacitación" });
    },
  });

  return { createSmsTrainingGroup: createMutation };
};

export const useUpdateSmsTrainingGroup = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ company, id, data }: UpdateSmsTrainingGroupData) => {
      const response = await axiosInstance.put(
        `/general/${company}/sms-training-groups/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-groups", company],
      });
      toast.success("¡Actualizado!", {
        description:
          "El grupo de capacitación ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el grupo de capacitación" });
    },
  });

  return { updateSmsTrainingGroup: updateMutation };
};

export const useDeleteSmsTrainingGroup = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      await axiosInstance.delete(
        `/general/${company}/sms-training-groups/${id}`,
      );
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-groups", company],
      });
      toast.success("¡Eliminado!", {
        description:
          "El grupo de capacitación ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el grupo de capacitación" });
    },
  });

  return { deleteSmsTrainingGroup: deleteMutation };
};
