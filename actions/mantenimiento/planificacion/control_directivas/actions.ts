import axiosInstance from "@/lib/axios";
import { DirectiveApplicability, DirectiveAuthority, DirectiveComplianceType, MaintenanceCountingMethod } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const firstBackendError = (error: any): string | undefined => {
  const errors = error?.response?.data?.errors;
  const firstMessage = errors && Object.values(errors).flat()[0];

  return (firstMessage as string | undefined) ?? error?.response?.data?.message;
};

export interface DirectiveIntervalData {
  counting_method: MaintenanceCountingMethod;
  limit_value: number;
  initial_value?: number;
}

export interface DirectiveItemData {
  id?: number;
  parent_aircraft_part_id?: number | null;
  maintenance_provider_id?: string;
  ad_number: string;
  authority: DirectiveAuthority;
  revision?: string;
  description: string;
  reference_document?: string;
  compliance_method?: string;
  applicability: DirectiveApplicability;
  applicability_notes?: string;
  compliance_type: DirectiveComplianceType;
  first_applied_date?: string;
  observations?: string;
  intervals: DirectiveIntervalData[];
}

export interface CreateDirectiveControlData {
  aircraft_id: string;
  title: string;
  description?: string;
  has_reference_manual: boolean;
  reference_manual?: string;
  maintenance_catalog_manual_id?: number;
  remaining_percentage: number;
  items: DirectiveItemData[];
}

export const useCreateDirectiveControl = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateDirectiveControlData; company: string }) => {
      await axiosInstance.post(`/${company}/directive-controls`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directive-controls"] });
      toast.success("¡Creado!", { description: "El control de directivas ha sido registrado correctamente." });
    },
    onError: (error: any) => {
      toast.error("Oops!", { description: firstBackendError(error) || "No se pudo registrar el control de directivas..." });
      console.log(error);
    },
  });

  return { createDirectiveControl: createMutation };
};

export const useUpdateDirectiveControl = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: string | number; data: CreateDirectiveControlData; company: string }) => {
      await axiosInstance.put(`/${company}/directive-controls/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directive-controls"] });
      queryClient.invalidateQueries({ queryKey: ["directive-control"], exact: false });
      toast.success("¡Actualizado!", { description: "El control de directivas ha sido actualizado correctamente." });
    },
    onError: (error: any) => {
      toast.error("Oops!", { description: firstBackendError(error) || "No se pudo actualizar el control de directivas..." });
      console.log(error);
    },
  });

  return { updateDirectiveControl: updateMutation };
};

export const useDeleteDirectiveControl = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string | null; id: string | number }) => {
      await axiosInstance.delete(`/${company}/directive-controls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directive-controls"] });
      toast.success("¡Eliminado!", { description: "El control de directivas ha sido eliminado correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "¡Hubo un error al eliminar el control de directivas!" });
    },
  });

  return { deleteDirectiveControl: deleteMutation };
};

export const useLinkDirectivePendingWorkOrder = () => {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async ({ company, itemId, workOrderId }: { company: string; itemId: string | number; workOrderId: string | number }) => {
      await axiosInstance.patch(`/${company}/directive-control-tasks/${itemId}/pending-work-order`, {
        work_order_id: workOrderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directive-controls"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["directive-control"], exact: false });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description: error?.response?.data?.message ?? "No se pudo asociar la Orden de Trabajo a la AD...",
      });
      console.log(error);
    },
  });

  return { linkDirectivePendingWorkOrder: linkMutation };
};

export interface CreateDirectiveComplianceData {
  directive_control_item_id: number;
  maintenance_provider_id: string;
  work_order_id?: string;
  compliance_date: string;
  hours_reading: number;
  cycles_reading: number;
  compliance_method?: string;
  notes?: string;
}

export const useCreateDirectiveCompliance = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateDirectiveComplianceData; company: string }) => {
      await axiosInstance.post(`/${company}/directive-compliances`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directive-control"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["directive-controls"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["directive-compliances"], exact: false });
      toast.success("¡Registrado!", { description: "El cumplimiento de la AD quedó registrado." });
    },
    onError: (error: any) => {
      toast.error("Oops!", { description: firstBackendError(error) || "No se pudo registrar el cumplimiento..." });
      console.log(error);
    },
  });

  return { createDirectiveCompliance: createMutation };
};
