import type { ConfirmedReason } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import {
  backendMessageFrom,
  type EditReasonValue,
} from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Interfaz para las partes de la aeronave en el API (part_type en minúsculas)
export interface AircraftPartAPI {
  part_name: string;
  part_number: string;
  serial: string;
  manufacturer_id: string;
  time_since_new: number | null;
  time_since_overhaul: number | null;
  cycles_since_new: number | null;
  cycles_since_overhaul: number | null;
  condition_type: "NEW" | "OVERHAULED";
  is_father?: boolean;
  part_type?: string;
  ata_chapter?: string | null;
  position?: string | null;
  part_order?: number | null;
  sub_parts?: AircraftPartAPI[];
}

export interface CreateAircraftWithPartsData {
  aircraft: {
    manufacturer_id?: string;
    client_id: string;
    serial: string;
    model?: string;
    acronym: string;
    flight_hours: number;
    flight_cycles: number;
    fabricant_date: Date;
    comments?: string;
    location_id: string;
    type: "MAINTENANCE" | "SHELTER";
  };
  parts: AircraftPartAPI[];
}

export const useCreateMaintenanceAircraft = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateAircraftWithPartsData;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/aircrafts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
      toast.success("¡Creado!", {
        description: `La aeronave ha sido creada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la aeronave...",
      });
      console.log(error);
    },
  });
  return {
    createMaintenanceAircraft: createMutation,
  };
};

export const useUpdateMaintenanceAircraft = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      acronym,
      data,
      company,
    }: {
      acronym: string;
      data: CreateAircraftWithPartsData & EditReasonValue;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/aircrafts/${acronym}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
      queryClient.invalidateQueries({ queryKey: ["aircraft"] });
      invalidatePlanificationAudit(queryClient);
      toast.success("¡Actualizado!", {
        description: "¡La aeronave se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description:
          backendMessageFrom(error) ??
          "Hubo un error al actualizar la aeronave.",
      });
    },
  });

  return {
    updateMaintenanceAircraft: updateMutation,
  };
};

export const useDeleteMaintenanceAircraft = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      acronym,
      company,
      reason,
    }: {
      acronym: string;
      company: string;
      reason: ConfirmedReason;
    }) => {
      await axiosInstance.delete(`/${company}/aircrafts/${acronym}`, {
        data: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircrafts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["aircraft"], exact: false });
      invalidatePlanificationAudit(queryClient);
      toast.success("¡Eliminada!", {
        description: `¡La aeronave ha sido eliminada correctamente!`,
      });
    },
  });

  return {
    deleteAircraft: deleteMutation,
  };
};
