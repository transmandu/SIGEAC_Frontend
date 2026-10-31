import { invalidatePlanificationAudit } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import axiosInstance from "@/lib/axios";
import { ComponentAction } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

/**
 * Iniciar y cerrar un cumplimiento, igual para los cuatro controles. Un ítem
 * tiene a lo sumo un cumplimiento vigente: se inicia uno, y se cierra con la
 * OT que lo culminó (opcionalmente iniciando el siguiente en el mismo paso).
 */
export type ComplianceKind =
  "maintenance" | "component" | "avionics" | "directive";

const KINDS: Record<
  ComplianceKind,
  { path: string; subjectKey: string; queryKeys: string[] }
> = {
  maintenance: {
    path: "maintenance-compliances",
    subjectKey: "maintenance_control_item_id",
    queryKeys: ["maintenance-controls", "maintenance-compliances"],
  },
  component: {
    path: "component-compliances",
    subjectKey: "component_control_item_id",
    queryKeys: [
      "component-control",
      "component-controls",
      "component-compliances",
    ],
  },
  avionics: {
    path: "avionics-compliances",
    subjectKey: "avionics_control_task_id",
    queryKeys: [
      "avionics-control",
      "avionics-controls",
      "avionics-compliances",
    ],
  },
  directive: {
    path: "directive-compliances",
    subjectKey: "directive_control_item_id",
    queryKeys: [
      "directive-control",
      "directive-controls",
      "directive-compliances",
    ],
  },
};

/** Lo que define cuándo y con qué lecturas arranca un período de cumplimiento. */
export interface ComplianceStartFields {
  maintenance_provider_id: string;
  applied_date: string;
  applied_hours?: number | null;
  applied_cycles?: number | null;
  work_order_id?: string;
  notes?: string;
  // Propios de cada control: el backend ignora los que no le corresponden.
  action?: ComponentAction;
  consumed_hours?: number;
  consumed_cycles?: number;
  compliance_method?: string;
}

export type StartComplianceData = ComplianceStartFields & {
  /** Id del ítem (o de la tarea, en aviónica). */
  subjectId: number | string;
};

export interface CloseComplianceData {
  completed_date: string;
  completed_hours?: number | null;
  completed_cycles?: number | null;
  /** Obligatoria al cerrar; puede omitirse solo si el cumplimiento ya la tenía atada. */
  work_order_id?: string;
  maintenance_provider_id?: string;
  notes?: string;
  /** Si viene, inicia el siguiente cumplimiento en el mismo paso. */
  next?: Partial<ComplianceStartFields>;
}

const useRefreshControls = (kind: ComplianceKind) => {
  const queryClient = useQueryClient();

  return () => {
    invalidatePlanificationAudit(queryClient);
    queryClient.invalidateQueries({ queryKey: ["control-queue"] });
    KINDS[kind].queryKeys.forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey: [queryKey], exact: false }),
    );
  };
};

export const useStartCompliance = (kind: ComplianceKind) => {
  const refresh = useRefreshControls(kind);
  const config = KINDS[kind];

  return useMutation({
    mutationFn: async ({
      company,
      data: { subjectId, ...fields },
    }: {
      company: string;
      data: StartComplianceData;
    }) => {
      const { data } = await axiosInstance.post(`/${company}/${config.path}`, {
        [config.subjectKey]: subjectId,
        ...fields,
      });
      return data;
    },
    onSuccess: () => {
      refresh();
      toast.success("¡Iniciado!", {
        description: "El cumplimiento quedó vigente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "iniciar el cumplimiento" });
      console.log(error);
    },
  });
};

export const useCloseCompliance = (kind: ComplianceKind) => {
  const refresh = useRefreshControls(kind);
  const config = KINDS[kind];

  return useMutation({
    mutationFn: async ({
      company,
      complianceId,
      data,
    }: {
      company: string;
      complianceId: number | string;
      data: CloseComplianceData;
    }) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/${config.path}/${complianceId}/close`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      refresh();
      toast.success("¡Cerrado!", {
        description: variables.data.next
          ? "El cumplimiento se cerró y el siguiente quedó vigente."
          : "El cumplimiento se cerró. El ítem no tiene cumplimiento vigente.",
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "cerrar el cumplimiento" });
      console.log(error);
    },
  });
};
