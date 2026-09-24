import type { ConfirmedReason } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import type { EditReasonValue } from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import {
  ComponentAction,
  ComponentCategory,
  ComponentLimitKind,
  MaintenanceCountingMethod,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Primer mensaje de validación del backend, sea del campo que sea. */
const firstBackendError = (error: any): string | undefined => {
  const errors = error?.response?.data?.errors;
  const firstMessage = errors && Object.values(errors).flat()[0];

  return (firstMessage as string | undefined) ?? error?.response?.data?.message;
};

export interface ComponentIntervalData {
  counting_method: MaintenanceCountingMethod;
  limit_kind: ComponentLimitKind;
  limit_value: number;
  initial_value?: number;
  consumed_at_event?: number;
}

export interface ComponentItemData {
  id?: number;
  parent_aircraft_part_id?: number | null;
  aircraft_part_id?: number | null;
  maintenance_catalog_service_id?: number | null;
  maintenance_provider_id: string;
  category: ComponentCategory;
  is_hazardous: boolean;
  description: string;
  part_number: string;
  serial: string;
  position?: string;
  action: ComponentAction;
  reference_document?: string;
  first_applied_date: string;
  remaining_percentage?: number | null;
  intervals: ComponentIntervalData[];
}

export interface CreateComponentControlData {
  aircraft_id: string;
  title: string;
  description?: string;
  has_reference_manual: boolean;
  reference_manual?: string;
  maintenance_catalog_manual_id?: number;
  remaining_percentage: number;
  items: ComponentItemData[];
}

export const useCreateComponentControl = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateComponentControlData;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/component-controls`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["component-controls"] });
      toast.success("¡Creado!", {
        description:
          "El control de componentes ha sido registrado correctamente.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) ||
          "No se pudo registrar el control de componentes...",
      });
      console.log(error);
    },
  });

  return { createComponentControl: createMutation };
};

export const useUpdateComponentControl = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string | number;
      data: CreateComponentControlData & EditReasonValue;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/component-controls/${id}`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["component-controls"] });
      queryClient.invalidateQueries({
        queryKey: ["component-control"],
        exact: false,
      });
      toast.success("¡Actualizado!", {
        description:
          "El control de componentes ha sido actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) ||
          "No se pudo actualizar el control de componentes...",
      });
      console.log(error);
    },
  });

  return { updateComponentControl: updateMutation };
};

export const useDeleteComponentControl = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
      reason,
    }: {
      company: string;
      id: string | number;
      reason: ConfirmedReason;
    }) => {
      await axiosInstance.delete(`/${company}/component-controls/${id}`, {
        data: reason,
      });
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["component-controls"] });
      toast.success("¡Eliminado!", {
        description:
          "El control de componentes ha sido eliminado correctamente.",
      });
    },
  });

  return { deleteComponentControl: deleteMutation };
};

export const useLinkComponentPendingWorkOrder = () => {
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
        `/${company}/component-control-items/${itemId}/pending-work-order`,
        {
          work_order_id: workOrderId,
        },
      );
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["component-controls"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["component-control"],
        exact: false,
      });
    },
    // El backend valida coherencia y devuelve el motivo exacto.
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ??
          "No se pudo asociar la Orden de Trabajo al componente...",
      });
      console.log(error);
    },
  });

  return { linkComponentPendingWorkOrder: linkMutation };
};

export interface CreateComponentComplianceData {
  component_control_item_id: number;
  maintenance_provider_id: string;
  work_order_id?: string;
  compliance_date: string;
  hours_reading: number;
  cycles_reading: number;
  action: ComponentAction;
  consumed_hours?: number;
  consumed_cycles?: number;
  notes?: string;
}

export const useCreateComponentCompliance = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateComponentComplianceData;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/component-compliances`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["component-control"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["component-controls"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["component-compliances"],
        exact: false,
      });
      toast.success("¡Registrado!", {
        description: "El cumplimiento del componente quedó registrado.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          firstBackendError(error) || "No se pudo registrar el cumplimiento...",
      });
      console.log(error);
    },
  });

  return { createComponentCompliance: createMutation };
};
