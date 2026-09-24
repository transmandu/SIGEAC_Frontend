import type { ConfirmedReason } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Espejo de ControlRetirementController::TYPES del backend. */
export type ControlRecordType =
  | "maintenance_control"
  | "maintenance_control_item"
  | "component_control"
  | "component_control_item"
  | "avionics_control"
  | "avionics_control_item"
  | "avionics_control_task"
  | "directive_control"
  | "directive_control_item";

const QUERY_KEYS: Record<string, string[]> = {
  maintenance: ["maintenance-controls"],
  component: ["component-controls", "component-control"],
  avionics: ["avionics-controls", "avionics-control"],
  directive: ["directive-controls", "directive-control"],
};

interface ControlRecordVariables {
  company: string;
  type: ControlRecordType;
  id: number | string;
  reason: ConfirmedReason;
}

const useControlRecordMutation = (verb: "retire" | "restore", done: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      type,
      id,
      reason,
    }: ControlRecordVariables) => {
      await axiosInstance.patch(
        `/${company}/control-records/${type}/${id}/${verb}`,
        reason,
      );
    },
    onSuccess: (_, { type }) => {
      QUERY_KEYS[type.split("_")[0]].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      invalidatePlanificationAudit(queryClient);
      toast.success(done);
    },
  });
};

/** El error queda en el diálogo de motivo, que muestra el mensaje del backend. */
export const useRetireControlRecord = () => ({
  retireControlRecord: useControlRecordMutation(
    "retire",
    "Dado de baja correctamente.",
  ),
});

export const useRestoreControlRecord = () => ({
  restoreControlRecord: useControlRecordMutation(
    "restore",
    "Reactivado correctamente.",
  ),
});
