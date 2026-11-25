import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CRITICAL_ALERT_SETTINGS_KEY } from "@/hooks/ajustes/alertas/useCriticalAlertSettings";
import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";

interface UpdateCriticalAlertInput {
  company: string;
  key: string;
  data: { is_enabled?: boolean; settings?: Record<string, string> };
}

/**
 * Activa/desactiva una alerta o cambia sus opciones. Además de refrescar la
 * pantalla se descarta lo que cada usuario tiene cacheado de "qué alertas me
 * tocan", para que el cambio se note sin esperar a que caduque.
 */
export const useUpdateCriticalAlertSetting = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ company, key, data }: UpdateCriticalAlertInput) =>
      await axiosInstance.put(
        `/${company}/critical-alert-settings/${key}`,
        data,
      ),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: [CRITICAL_ALERT_SETTINGS_KEY, company],
      });
      queryClient.invalidateQueries({
        queryKey: ["critical-alert-sources", company],
      });
      toast.success("¡Actualizado!", {
        description: "La configuración de la alerta ha sido guardada.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "guardar la configuración de la alerta" });
    },
  });

  return { updateAlert: updateMutation };
};
