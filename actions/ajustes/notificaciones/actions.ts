import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AudiencePayload } from "@/components/forms/recipients/audience-types";
import { IN_APP_AUDIENCE_KEY } from "@/hooks/ajustes/notificaciones/useInAppAudience";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";

export const useCreateInAppAudienceRule = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: AudiencePayload;
    }) => await axiosInstance.post(`/${company}/notification-audience`, data),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: [IN_APP_AUDIENCE_KEY, company],
      });
      toast.success("¡Agregado!", {
        description: "Recibirá esta notificación desde ahora.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "agregar a quien recibe la notificación" });
    },
  });

  return { createRule: createMutation };
};

export const useUpdateInAppAudienceRule = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: number;
      data: AudiencePayload;
      /** El interruptor de activar/desactivar no necesita un aviso aparte. */
      silent?: boolean;
    }) =>
      await axiosInstance.put(`/${company}/notification-audience/${id}`, data),
    onSuccess: (_, { company, silent }) => {
      queryClient.invalidateQueries({
        queryKey: [IN_APP_AUDIENCE_KEY, company],
      });
      if (!silent) {
        toast.success("¡Actualizado!", {
          description: "El destinatario ha sido actualizado correctamente.",
        });
      }
    },
    onError: (error) => {
      notifyError(error, {
        action: "actualizar a quien recibe la notificación",
      });
    },
  });

  return { updateRule: updateMutation };
};

export const useDeleteInAppAudienceRule = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) =>
      await axiosInstance.delete(`/${company}/notification-audience/${id}`),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: [IN_APP_AUDIENCE_KEY, company],
      });
      toast.success("¡Eliminado!", {
        description: "Dejará de recibir esta notificación.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "quitar a quien recibe la notificación" });
    },
  });

  return { deleteRule: deleteMutation };
};
