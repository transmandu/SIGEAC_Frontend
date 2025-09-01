import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MitigationPlanData {
  company: string | null;
  data: {
    description: string;
    responsible: string;
    start_date: Date;
    danger_identification_id: number;
  };
}

interface UpdateMitigationPlanData {
  company: string | null;
  id: string;
  data: {
    description: string;
    responsible: string;
    start_date: Date;
  };
}

interface updateStatus {
  company: string | null;
  data: {
    mitigation_id: number | string;
    result: string;
  };
}
export const useCreateMitigationPlan = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    //    mutationKey: ["danger-identifications/${id}"],
    mutationFn: async ({ data, company }: MitigationPlanData) => {
      await axiosInstance.post(`/${company}/sms/mitigation-plans`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-plans"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("¡Creado!", {
        description: ` El plan de mitigacion ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el plan de mitigation...",
      });
      console.log(error);
    },
  });
  return {
    createMitigationPlan: createMutation,
  };
};

export const useDeleteMitigationPlan = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string;
    }) => {
      await axiosInstance.delete(`/${company}/sms/mitigation-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-plans"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("¡Eliminado!", {
        description: `¡El plan de mitigacion ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el plan de mitigacion!",
      });
    },
  });

  return {
    deleteMitigationPlan: deleteMutation,
  };
};

export const useUpdateMitigationPlan = () => {
  const queryClient = useQueryClient();

  const updateMitigationPlanMutation = useMutation({
    mutationKey: ["mitigation-plans"],
    mutationFn: async ({ data, id, company }: UpdateMitigationPlanData) => {
      await axiosInstance.patch(`/${company}/sms/mitigation-plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("¡Actualizado!", {
        description: `El plan de mitigacion ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el plan de mitigacion...",
      });
      console.log(error);
    },
  });
  return {
    updateMitigationPlan: updateMitigationPlanMutation,
  };
};

export const useCloseReport = () => {
  const queryClient = useQueryClient();
  const closeReportMutation = useMutation({
    mutationKey: ["close-report"],
    mutationFn: async ({ data, company }: updateStatus) => {
      console.log("mitigation_id", data.mitigation_id);
      await axiosInstance.patch(
        `/${company}/sms/close_report/${data.mitigation_id}`,
        data
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-plans"] });
      queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
      queryClient.invalidateQueries({ queryKey: ["obligatory-reports"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("Reporte Cerrado!", {
        description: `Se ha cerrado el reporte correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo cerrar el reporte...",
      });
      console.log(error);
    },
  });
  return {
    closeReportByMitigationId: closeReportMutation,
  };
};

export const useOpenReport = () => {
  const queryClient = useQueryClient();
  const openReportMutation = useMutation({
    mutationKey: ["open-report"],
    mutationFn: async ({ data, company }: updateStatus) => {
      await axiosInstance.patch(
        `/${company}/sms/open_report/${data.mitigation_id}`,
        data
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitigation-plans"] });
      queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
      queryClient.invalidateQueries({ queryKey: ["obligatory-reports"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("Reporte Cerrado!", {
        description: `Se ha abierto el reporte correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo abrir el reporte...",
      });
      console.log(error);
    },
  });
  return {
    openReportByMitigationId: openReportMutation,
  };
};