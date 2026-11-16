import type { ConfirmedReason } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EditReasonValue } from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import { notifyError } from "@/lib/notify-error";

import type { QueryClient } from "@tanstack/react-query";

/**
 * Un vuelo suma o resta horas y ciclos a la aeronave y a sus partes: además de
 * la lista de vuelos, quedan viejos los totales de las aeronaves, los promedios
 * y el historial por rango.
 */
export const invalidateFlightData = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["flight-control"] });
  queryClient.invalidateQueries({ queryKey: ["flights-by-date-range"] });
  queryClient.invalidateQueries({ queryKey: ["average-cycles-hours"] });
  queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
  queryClient.invalidateQueries({ queryKey: ["aircraft"] });
  invalidatePlanificationAudit(queryClient);
};

interface CreateFlightControlData {
  aircraft_id: string;
  flight_cycles: number;
  flight_hours: number;
  /** Fecha de calendario `yyyy-MM-dd`, no un instante. */
  flight_date: string;
  flight_number?: string;
  origin?: string;
  destination?: string;
  aircraft_operator?: string;
}

export const useCreateFlightControl = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateFlightControlData | CreateFlightControlData[];
      company: string;
    }) => {
      const flights = Array.isArray(data) ? data : [data];
      await axiosInstance.post(`/${company}/flight-control`, { flights });
    },
    onSuccess: () => {
      invalidateFlightData(queryClient);
      toast.success("¡Creado!", {
        description: `El/los vuelo(s) ha(n) sido registrado(s) correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "registrar el/los vuelo(s)" });
      console.log(error);
    },
  });
  return {
    createFlightControl: createMutation,
  };
};

export const useUpdateFlightControl = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string;
      data: Partial<CreateFlightControlData> & EditReasonValue;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/flight-control/${id}`, data);
    },
    onSuccess: () => {
      invalidateFlightData(queryClient);
      toast.success("¡Actualizado!", {
        description: `El vuelo ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el vuelo" });
      console.log(error);
    },
  });
  return {
    updateFlightControl: updateMutation,
  };
};

export const useDeleteFlightControl = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ["flight-control"],
    mutationFn: async ({
      company,
      id,
      reason,
    }: {
      company: string;
      id: string | number;
      reason: ConfirmedReason;
    }) => {
      await axiosInstance.delete(`/${company}/flight-control/${id}`, {
        data: reason,
      });
    },
    onSuccess: () => {
      invalidateFlightData(queryClient);
      toast.success("¡Eliminado!", {
        description: `¡El vuelo ha sido eliminado correctamente!`,
      });
    },
  });

  return {
    deleteFlightControl: deleteMutation,
  };
};
