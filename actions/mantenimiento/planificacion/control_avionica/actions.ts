import axiosInstance from "@/lib/axios";
import { AvionicsAction, AvionicsCategory, MaintenanceCountingMethod } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const firstBackendError = (error: any): string | undefined => {
  const errors = error?.response?.data?.errors;
  const firstMessage = errors && Object.values(errors).flat()[0];

  return (firstMessage as string | undefined) ?? error?.response?.data?.message;
};

export interface AvionicsIntervalData {
  counting_method: MaintenanceCountingMethod;
  limit_value: number;
  initial_value?: number;
}

export interface AvionicsTaskData {
  id?: number;
  action: AvionicsAction;
  is_on_condition: boolean;
  maintenance_provider_id?: string;
  first_applied_date?: string;
  remaining_percentage?: number | null;
  intervals: AvionicsIntervalData[];
}

export interface AvionicsItemData {
  id?: number;
  aircraft_part_id?: number | null;
  maintenance_catalog_service_id?: number | null;
  category: AvionicsCategory;
  is_hazardous: boolean;
  description: string;
  part_number: string;
  serial: string;
  position?: string;
  reference_document?: string;
  tasks: AvionicsTaskData[];
}

export interface CreateAvionicsControlData {
  aircraft_id: string;
  title: string;
  description?: string;
  has_reference_manual: boolean;
  reference_manual?: string;
  maintenance_catalog_manual_id?: number;
  remaining_percentage: number;
  items: AvionicsItemData[];
}

export const useCreateAvionicsControl = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateAvionicsControlData; company: string }) => {
      await axiosInstance.post(`/${company}/avionics-controls`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      toast.success("¡Creado!", { description: "El control de aviónica ha sido registrado correctamente." });
    },
    onError: (error: any) => {
      toast.error("Oops!", { description: firstBackendError(error) || "No se pudo registrar el control de aviónica..." });
      console.log(error);
    },
  });

  return { createAvionicsControl: createMutation };
};

export const useUpdateAvionicsControl = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: string | number; data: CreateAvionicsControlData; company: string }) => {
      await axiosInstance.put(`/${company}/avionics-controls/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      queryClient.invalidateQueries({ queryKey: ["avionics-control"], exact: false });
      toast.success("¡Actualizado!", { description: "El control de aviónica ha sido actualizado correctamente." });
    },
    onError: (error: any) => {
      toast.error("Oops!", { description: firstBackendError(error) || "No se pudo actualizar el control de aviónica..." });
      console.log(error);
    },
  });

  return { updateAvionicsControl: updateMutation };
};

export const useDeleteAvionicsControl = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string | null; id: string | number }) => {
      await axiosInstance.delete(`/${company}/avionics-controls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      toast.success("¡Eliminado!", { description: "El control de aviónica ha sido eliminado correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "¡Hubo un error al eliminar el control de aviónica!" });
    },
  });

  return { deleteAvionicsControl: deleteMutation };
};

export const useLinkAvionicsPendingWorkOrder = () => {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async ({ company, taskId, workOrderId }: { company: string; taskId: string | number; workOrderId: string | number }) => {
      await axiosInstance.patch(`/${company}/avionics-control-tasks/${taskId}/pending-work-order`, {
        work_order_id: workOrderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["avionics-control"], exact: false });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description: error?.response?.data?.message ?? "No se pudo asociar la Orden de Trabajo a la tarea...",
      });
      console.log(error);
    },
  });

  return { linkAvionicsPendingWorkOrder: linkMutation };
};

export interface CreateAvionicsComplianceData {
  avionics_control_task_id: number;
  maintenance_provider_id: string;
  work_order_id?: string;
  compliance_date: string;
  hours_reading: number;
  cycles_reading: number;
  notes?: string;
}

export const useCreateAvionicsCompliance = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateAvionicsComplianceData; company: string }) => {
      await axiosInstance.post(`/${company}/avionics-compliances`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avionics-control"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["avionics-compliances"], exact: false });
      toast.success("¡Registrado!", { description: "El cumplimiento de la tarea quedó registrado." });
    },
    onError: (error: any) => {
      toast.error("Oops!", { description: firstBackendError(error) || "No se pudo registrar el cumplimiento..." });
      console.log(error);
    },
  });

  return { createAvionicsCompliance: createMutation };
};
