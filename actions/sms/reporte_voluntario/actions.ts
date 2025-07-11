import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface VoluntaryReportData {
  company: string | null;
  reportData: {
    report_number?: string;
    identification_date: Date;
    report_date: Date;
    danger_location: string;
    danger_area: string;
    description: string;
    possible_consequences: string;
    status: string;
    name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    image?: File | string;
    document?: File | string;
  };
}
interface UpdateVoluntaryReportData {
  id: number;
  report_number?: string;
  report_date: Date;
  identification_date: Date;
  danger_location: string;
  danger_area: string;
  description: string;
  possible_consequences: string;
  danger_identification_id: number;
  status: string;
  reporter_name?: string;
  reporter_last_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  image?: File | string;
  document?: File | string;
}

export const useCreateVoluntaryReport = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["voluntary-reports"],
    mutationFn: async (data: VoluntaryReportData) => {
      const response = await axiosInstance.post(
        `/${data.company}/sms/voluntary-reports`,
        data.reportData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
      toast.success("¡Creado!", {
        description: `El reporte voluntario ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el reporte...",
      });
      console.log(error);
    },
  });
  return {
    createVoluntaryReport: createMutation,
  };
};

export const useDeleteVoluntaryReport = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ["voluntary-reports"],
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string | number;
    }) => {
      await axiosInstance.delete(`/${company}/sms/voluntary-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danger-identifications"] });
      queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("¡Eliminado!", {
        description: `¡El reporte ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el reporte!",
      });
    },
  });

  return {
    deleteVoluntaryReport: deleteMutation,
  };
};

export const useUpdateVoluntaryReport = () => {
  const queryClient = useQueryClient();

  const updateVoluntaryReportMutation = useMutation({
    mutationKey: ["voluntary-reports"],
    mutationFn: async (data: UpdateVoluntaryReportData) => {
      const response = await axiosInstance.post(
        `/transmandu/sms/update/voluntary-reports/${data.id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
      queryClient.invalidateQueries({ queryKey: ["voluntary-report"] });
      toast.success("¡Actualizado!", {
        description: `El reporte voluntario ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el reporte voluntario...",
      });
      console.log(error);
    },
  });
  return {
    updateVoluntaryReport: updateVoluntaryReportMutation,
  };
};

export const useAcceptVoluntaryReport = () => {
  const queryClient = useQueryClient();

  const acceptVoluntaryReportMutation = useMutation({
    mutationKey: ["voluntary-reports"],
    mutationFn: async (data: UpdateVoluntaryReportData) => {
      const response = await axiosInstance.patch(
        `/transmandu/sms/accept/voluntary-reports/${data.id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
      queryClient.invalidateQueries({ queryKey: ["voluntary-report"] });
      toast.success("Aceptado!", {
        description: `El reporte voluntario ha sido aceptado.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo aceptar el reporte voluntario...",
      });
      console.log(error);
    },
  });
  return {
    acceptVoluntaryReport: acceptVoluntaryReportMutation,
  };
};
