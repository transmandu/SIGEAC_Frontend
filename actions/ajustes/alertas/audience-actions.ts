import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CRITICAL_ALERT_AUDIENCE_KEY } from "@/hooks/ajustes/alertas/useCriticalAlertAudience";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import type { AudiencePayload } from "@/components/forms/recipients/audience-types";

/**
 * Cambiar quién ve una alerta cambia lo que cada usuario debe pedir: además de
 * refrescar la pantalla se descarta lo cacheado de "qué alertas me tocan".
 */
const useRefreshAudience = () => {
  const queryClient = useQueryClient();

  return (company: string) => {
    queryClient.invalidateQueries({
      queryKey: [CRITICAL_ALERT_AUDIENCE_KEY, company],
    });
    queryClient.invalidateQueries({
      queryKey: ["critical-alert-sources", company],
    });
  };
};

export const useCreateAlertAudienceRule = () => {
  const refresh = useRefreshAudience();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: AudiencePayload;
    }) => await axiosInstance.post(`/${company}/critical-alert-audience`, data),
    onSuccess: (_, { company }) => {
      refresh(company);
      toast.success("¡Agregado!", {
        description: "Quien se agregó verá esta alerta desde ahora.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "agregar a quien ve la alerta" });
    },
  });

  return { createRule: createMutation };
};

export const useUpdateAlertAudienceRule = () => {
  const refresh = useRefreshAudience();

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
      await axiosInstance.put(
        `/${company}/critical-alert-audience/${id}`,
        data,
      ),
    onSuccess: (_, { company, silent }) => {
      refresh(company);
      if (!silent) {
        toast.success("¡Actualizado!", {
          description: "La audiencia de la alerta ha sido actualizada.",
        });
      }
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar quien ve la alerta" });
    },
  });

  return { updateRule: updateMutation };
};

export const useDeleteAlertAudienceRule = () => {
  const refresh = useRefreshAudience();

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) =>
      await axiosInstance.delete(`/${company}/critical-alert-audience/${id}`),
    onSuccess: (_, { company }) => {
      refresh(company);
      toast.success("¡Eliminado!", {
        description: "Dejará de ver esta alerta en su panel.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "quitar a quien ve la alerta" });
    },
  });

  return { deleteRule: deleteMutation };
};
