import type { ConfirmedReason } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import type { EditReasonValue } from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import {
  AvionicsAction,
  ControlItemFlag,
  MaintenanceCountingMethod,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

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
  never_performed?: boolean;
  applied_date?: string;
  remaining_percentage?: number | null;
  intervals: AvionicsIntervalData[];
}

export interface AvionicsItemData {
  id?: number;
  aircraft_part_id?: number | null;
  maintenance_catalog_service_id?: number | null;
  flags: ControlItemFlag[];
  description: string;
  declared_description?: string;
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
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateAvionicsControlData;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/avionics-controls`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      toast.success("¡Creado!", {
        description: "El control de aviónica ha sido registrado correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "registrar el control de aviónica" });
      console.log(error);
    },
  });

  return { createAvionicsControl: createMutation };
};

export const useUpdateAvionicsControl = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string | number;
      data: CreateAvionicsControlData & EditReasonValue;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/avionics-controls/${id}`, data);
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      queryClient.invalidateQueries({
        queryKey: ["avionics-control"],
        exact: false,
      });
      toast.success("¡Actualizado!", {
        description:
          "El control de aviónica ha sido actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "actualizar el control de aviónica" });
      console.log(error);
    },
  });

  return { updateAvionicsControl: updateMutation };
};

export const useAddAvionicsControlItem = () => {
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async ({
      company,
      controlId,
      data,
    }: {
      company: string;
      controlId: string | number;
      data: AvionicsItemData;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/avionics-controls/${controlId}/items`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      queryClient.invalidateQueries({
        queryKey: ["avionics-control"],
        exact: false,
      });
      toast.success("¡Agregado!", {
        description: "El equipo ha sido agregado al control correctamente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "agregar el equipo" });
      console.log(error);
    },
  });

  return { addAvionicsControlItem: addItemMutation };
};

export const useDeleteAvionicsControl = () => {
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
      await axiosInstance.delete(`/${company}/avionics-controls/${id}`, {
        data: reason,
      });
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({ queryKey: ["avionics-controls"] });
      toast.success("¡Eliminado!", {
        description: "El control de aviónica ha sido eliminado correctamente.",
      });
    },
  });

  return { deleteAvionicsControl: deleteMutation };
};

export const useLinkAvionicsPendingWorkOrder = () => {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async ({
      company,
      taskId,
      workOrderId,
    }: {
      company: string;
      taskId: string | number;
      workOrderId: string | number;
    }) => {
      await axiosInstance.patch(
        `/${company}/avionics-control-tasks/${taskId}/work-order`,
        {
          work_order_id: workOrderId,
        },
      );
    },
    onSuccess: () => {
      invalidatePlanificationAudit(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["avionics-controls"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["avionics-control"],
        exact: false,
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "asociar la Orden de Trabajo a la tarea" });
      console.log(error);
    },
  });

  return { linkAvionicsPendingWorkOrder: linkMutation };
};

export interface ImportAvionicsComplianceHistorySkippedRow {
  row: number;
  reason: string;
}

export interface ImportAvionicsComplianceHistoryResult {
  imported: number;
  skipped: ImportAvionicsComplianceHistorySkippedRow[];
}

// Sincrónico (no se encola): el archivo es de un solo control y a lo sumo
// unas pocas decenas de filas, así que se procesa en la misma petición y la
// respuesta ya trae el resumen final (importados/omitidos), no un estado a consultar.
export const useImportAvionicsComplianceHistory = () => {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async ({
      file,
      controlId,
      company,
    }: {
      file: File;
      controlId: string | number;
      company: string;
    }): Promise<ImportAvionicsComplianceHistoryResult> => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosInstance.post(
        `/${company}/avionics-controls/${controlId}/import-compliance-history`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["avionics-compliances"] });
      if (result.imported > 0) {
        toast.success("¡Histórico importado!", {
          description: `${result.imported} cumplimiento(s) cargado(s)${result.skipped.length ? `, ${result.skipped.length} fila(s) omitida(s).` : "."}`,
        });
      } else {
        toast.error("¡Ops! Nada para importar", {
          description:
            "Ninguna fila coincidió con una tarea programada de este control.",
        });
      }
    },
    onError: (error) => {
      notifyError(error, { action: "importar el archivo" });
      console.log(error);
    },
  });

  return {
    importAvionicsComplianceHistory: importMutation,
  };
};
