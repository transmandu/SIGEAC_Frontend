import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import {
  ControlQueueAttachResult,
  ControlQueueEntry,
  ControlQueueType,
} from "@/types";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

const firstBackendError = (error: any): string | undefined => {
  const errors = error?.response?.data?.errors;
  const firstMessage = errors && Object.values(errors).flat()[0];

  return (firstMessage as string | undefined) ?? error?.response?.data?.message;
};

/**
 * La bandeja toca los cuatro controles: la OT que sale de acá queda como
 * `pending_work_order` de cada ítem y eso se ve en la columna de OT de su
 * propia pantalla. Invalidar solo la bandeja dejaba esas tablas mostrando el
 * estado anterior hasta recargar.
 */
const invalidateQueueAndControls = (queryClient: QueryClient) => {
  for (const key of [
    "control-queue",
    "control-queue-formats",
    // Listados y detalles usan claves distintas (plural / singular), y la que
    // pinta las tablas de ítems es la del detalle: con solo los plurales, la
    // columna de OT del control seguía mostrando el estado anterior.
    "maintenance-controls",
    "component-controls",
    "component-control",
    "avionics-controls",
    "avionics-control",
    "directive-controls",
    "directive-control",
  ]) {
    queryClient.invalidateQueries({ queryKey: [key], exact: false });
  }
};

export const useAddToControlQueue = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async ({
      company,
      type,
      itemId,
      note,
    }: {
      company: string;
      type: ControlQueueType;
      itemId: string | number;
      note?: string;
    }) => {
      const { data } = await axiosInstance.post<ControlQueueEntry>(
        `/${company}/control-queue`,
        { type, item_id: itemId, note },
      );
      return data;
    },
    onSuccess: () => {
      invalidateQueueAndControls(queryClient);
    },
    // El backend explica por qué no entró (dado de baja, por ejemplo): eso le
    // aeronave con su matrícula en el mensaje): eso le dice al usuario qué
    // hacer, un texto genérico no.
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) || "No se pudo agregar a la bandeja...",
      });
      console.log(error);
    },
  });

  return { addToControlQueue: addMutation };
};

export const useRemoveFromControlQueue = () => {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: async ({
      company,
      entryId,
    }: {
      company: string;
      entryId: string | number;
    }) => {
      await axiosInstance.delete(`/${company}/control-queue/${entryId}`);
    },
    onSuccess: () => {
      invalidateQueueAndControls(queryClient);
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) || "No se pudo quitar de la bandeja...",
      });
      console.log(error);
    },
  });

  return { removeFromControlQueue: removeMutation };
};

export const useClearControlQueue = () => {
  const queryClient = useQueryClient();

  const clearMutation = useMutation({
    mutationFn: async ({
      company,
      aircraftId,
    }: {
      company: string;
      aircraftId?: number | string;
    }) => {
      await axiosInstance.delete(`/${company}/control-queue/clear`, {
        params: aircraftId ? { aircraft_id: aircraftId } : undefined,
      });
    },
    onSuccess: () => {
      invalidateQueueAndControls(queryClient);
      toast.success("Bandeja vaciada", {
        description: "Se quitaron todos los ítems de la bandeja.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) || "No se pudo vaciar la bandeja...",
      });
      console.log(error);
    },
  });

  return { clearControlQueue: clearMutation };
};

/**
 * Ata una OT ya creada a los ítems seleccionados de la bandeja. El backend
 * salta lo que no pudo atar y lo deja en la bandeja con su motivo, así que el
 * resultado se informa en dos toasts: lo que entró y lo que quedó pendiente.
 */
export const useAttachWorkOrderToQueue = () => {
  const queryClient = useQueryClient();

  const attachMutation = useMutation({
    mutationFn: async ({
      company,
      workOrderId,
      entryIds,
    }: {
      company: string;
      workOrderId: string | number;
      entryIds: number[];
    }) => {
      const { data } = await axiosInstance.post<ControlQueueAttachResult>(
        `/${company}/control-queue/work-order`,
        { work_order_id: workOrderId, entry_ids: entryIds },
      );
      return data;
    },
    onSuccess: (result) => {
      invalidatePlanificationAudit(queryClient);
      invalidateQueueAndControls(queryClient);

      if (result.attached.length) {
        toast.success(`Orden ${result.work_order.order_number} asociada`, {
          description: `${result.attached.length} cumplimiento(s) quedaron atendidos por esta orden.`,
        });
      }

      if (result.skipped.length) {
        toast.warning("Algunos cumplimientos no se asociaron", {
          description: result.skipped
            .map((s) => `${s.label ?? `#${s.id}`}: ${s.reason}`)
            .join(" · "),
        });
      }
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) ||
          "No se pudo asociar la Orden de Trabajo a lo seleccionado...",
      });
      console.log(error);
    },
  });

  return { attachWorkOrderToQueue: attachMutation };
};
