import type { ConfirmedReason } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import type { EditReasonValue } from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import { MaintenanceControlItemInterval } from "@/types";
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Un ítem cargado a mano crea además su entrada en el catálogo (sin manual,
// incompleta): hay que refrescar el catálogo, no solo el control.
const invalidateCatalog = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
};
/**
 * Primer mensaje de validación que haya devuelto el backend, sea del campo
 * que sea. Antes solo se leía `errors.aircraft_id`, así que un error de
 * cualquier otro campo (lectura inicial incoherente, unidad repetida...)
 * caía en el texto genérico y el usuario no tenía forma de saber qué
 * corregir.
 */
const firstBackendError = (error: any): string | undefined => {
  const errors = error?.response?.data?.errors;
  const firstMessage = errors && Object.values(errors).flat()[0];

  return (firstMessage as string | undefined) ?? error?.response?.data?.message;
};

interface MaintenanceItemData {
  id?: number;
  maintenance_catalog_service_id?: number;
  description: string;
  declared_description?: string;
  applied_date?: string;
  remaining_percentage?: number | null;
  intervals: MaintenanceControlItemInterval[];
  maintenance_provider_id?: string;
}

interface MaintenanceControlPartData {
  aircraft_part_id: string;
  services: MaintenanceItemData[];
}

export interface CreateMaintenanceControlData {
  aircraft_id: string;
  title: string;
  description?: string;
  has_reference_manual: boolean;
  reference_manual?: string;
  remaining_percentage: number;
  certificates: MaintenanceItemData[];
  services: MaintenanceItemData[];
  parts: MaintenanceControlPartData[];
}

export const useCreateMaintenanceControl = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateMaintenanceControlData;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/maintenance-controls`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["maintenance-controls"] });
      invalidateCatalog(queryClient);
      toast.success("¡Creado!", {
        description: `El control de mantenimiento ha sido registrado correctamente.`,
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) ||
          "No se pudo registrar el control de mantenimiento...",
      });
      console.log(error);
    },
  });

  return {
    createMaintenanceControl: createMutation,
  };
};

export const useUpdateMaintenanceControl = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string | number;
      data: CreateMaintenanceControlData & EditReasonValue;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/maintenance-controls/${id}`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["maintenance-controls"] });
      invalidateCatalog(queryClient);
      toast.success("¡Actualizado!", {
        description: `El control de mantenimiento ha sido actualizado correctamente.`,
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) ||
          "No se pudo actualizar el control de mantenimiento...",
      });
      console.log(error);
    },
  });

  return {
    updateMaintenanceControl: updateMutation,
  };
};

export const useAddMaintenanceControlItem = () => {
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async ({
      company,
      controlId,
      data,
    }: {
      company: string;
      controlId: string | number;
      data: MaintenanceItemData & {
        item_type: "CERTIFICATE" | "SERVICE";
        aircraft_part_id?: number;
      };
    }) => {
      const response = await axiosInstance.post(
        `/${company}/maintenance-controls/${controlId}/items`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["maintenance-controls"],
        exact: false,
      });
      invalidateCatalog(queryClient);
      toast.success("¡Agregado!", {
        description: "El ítem ha sido agregado al control correctamente.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) || "No se pudo agregar el ítem...",
      });
      console.log(error);
    },
  });

  return {
    addMaintenanceControlItem: addItemMutation,
  };
};

export const useLinkPendingWorkOrder = () => {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async ({
      company,
      itemId,
      workOrderId,
    }: {
      company: string;
      itemId: string | number;
      workOrderId: string | number;
    }) => {
      await axiosInstance.patch(
        `/${company}/maintenance-control-items/${itemId}/work-order`,
        {
          work_order_id: workOrderId,
        },
      );
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["maintenance-controls"],
        exact: false,
      });
    },
    // El backend valida coherencia (misma aeronave, orden abierta, ítem
    // realmente crítico, sin otra orden ya atendiéndolo) y devuelve el motivo
    // exacto: mostrarlo importa más que un mensaje genérico.
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ??
          "No se pudo asociar la Orden de Trabajo al ítem...",
      });
      console.log(error);
    },
  });

  return {
    linkPendingWorkOrder: linkMutation,
  };
};

export const useDeleteMaintenanceControl = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ["maintenance-controls"],
    mutationFn: async ({
      company,
      id,
      reason,
    }: {
      company: string;
      id: string | number;
      reason: ConfirmedReason;
    }) => {
      await axiosInstance.delete(`/${company}/maintenance-controls/${id}`, {
        data: reason,
      });
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["maintenance-controls"] });
      toast.success("¡Eliminado!", {
        description: `¡El control de mantenimiento ha sido eliminado correctamente!`,
      });
    },
  });

  return {
    deleteMaintenanceControl: deleteMutation,
  };
};
