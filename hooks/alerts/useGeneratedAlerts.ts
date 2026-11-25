import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import axios from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCriticalAlertSources } from "./useCriticalAlertSources";
import type { CriticalAlert } from "./types";

/**
 * Alerta que el sistema generó (una por día y sujeto) y sigue sin atenderse.
 * El payload es lo que se guardó al generarla.
 */
interface GeneratedAlert {
  id: number;
  alert_key: string;
  subject_id: number;
  day: string;
  payload: {
    work_order?: {
      order_number: string;
      aircraft: string | null;
      description: string | null;
    };
    items?: { label: string }[];
  };
}

const GENERATED_KEY = "generated-critical-alerts";

/**
 * Alertas que el sistema genera por día (hoy, el informe de remanente de las
 * órdenes de trabajo). A diferencia de las demás no se calculan en vivo ni se
 * descartan: se atienden. Confirmar manda el correo a los destinatarios
 * configurados; nada sale solo.
 */
export const useGeneratedAlerts = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const { hasSource } = useCriticalAlertSources();

  const enabled = !!company && hasSource("maintenance_remaining_report");

  const { data, isLoading } = useQuery<GeneratedAlert[]>({
    queryKey: [GENERATED_KEY, company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/critical-alerts/generated`);
      return data.alerts ?? [];
    },
    enabled,
    // Se generan una vez al día; un refresco ocasional basta.
    staleTime: 1000 * 60 * 5,
  });

  const send = useMutation({
    mutationFn: async (id: number) =>
      (await axios.post(`/${company}/critical-alerts/generated/${id}/send`))
        .data as { sent_to: number },
    onSuccess: ({ sent_to }) => {
      queryClient.invalidateQueries({ queryKey: [GENERATED_KEY, company] });
      toast.success("¡Informe enviado!", {
        description: `Se envió a ${sent_to} destinatario${sent_to === 1 ? "" : "s"}.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "enviar el informe" });
    },
  });

  const {
    mutate: sendReport,
    isPending: isSending,
    variables: sendingId,
  } = send;

  const alerts = useMemo<CriticalAlert[]>(
    () =>
      (enabled ? (data ?? []) : []).map((alert) => {
        const workOrder = alert.payload.work_order;
        const items = alert.payload.items ?? [];
        const shown = items.slice(0, 3).map((item) => item.label);
        const rest = items.length - shown.length;

        return {
          id: `generated-alert-${alert.id}`,
          source: alert.alert_key,
          sourceId: alert.id,
          tone: "maintenance",
          // Un informe pendiente pesa lo que una alerta temprana: recuerda una
          // obligación, no un plazo vencido.
          weight: 40,
          // No se descarta: se atiende enviándolo. Quitarlo de la vista no
          // cumple con informar.
          isDismissable: false,
          title:
            `Informe del remanente · OT ${workOrder?.order_number ?? ""}`.trim(),
          label: workOrder?.aircraft ?? undefined,
          description: [
            `${items.length} servicio${items.length === 1 ? "" : "s"} con la orden emitida. Envíe el informe del remanente a quienes lo reciben.`,
            ...shown,
            rest > 0 ? `y ${rest} más` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          severity: "warning",
          confirmLabel: "Enviar informe",
          onConfirm: () => sendReport(alert.id),
          isConfirming: isSending && sendingId === alert.id,
        } satisfies CriticalAlert;
      }),
    [enabled, data, sendReport, isSending, sendingId],
  );

  return { alerts, isLoading: enabled && isLoading };
};
