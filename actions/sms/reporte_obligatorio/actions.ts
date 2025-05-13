import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ObligatoryReportData {
  report_number: string;
  description: string;
  incident_location: string;
  report_date: Date;
  incident_date: Date;
  incident_time: string;
  flight_time: string;
  pilot_id: string;
  copilot_id: string;
  aircraft_acronym: string;
  aircraft_model: string;
  flight_number: string;
  flight_origin: string;
  flight_destiny: string;
  flight_alt_destiny: string;
  incidents?: string[];
  other_incidents?: string;
  status: string;
  image?: File | string;
  document?: File | string;
}

interface UpdateObligatoryReportData {
  id: number | string;
  report_number: string;
  description: string;
  incident_location: string;
  report_date: Date;
  incident_date: Date;
  incident_time: string;
  flight_time: string;
  pilot_id: string;
  copilot_id: string;
  aircraft_acronym: string;
  aircraft_model: string;
  flight_number: string;
  flight_origin: string;
  flight_destiny: string;
  flight_alt_destiny: string;
  incidents?: string[];
  other_incidents?: string;
}


export const useCreateObligatoryReport = () => {
  
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["obligatory-reports"],
    mutationFn: async (data: ObligatoryReportData) => {
      await axiosInstance.post("/transmandu/sms/obligatory-reports", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("THIS IS THE DATA RSO",data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obligatory-reports"] });
      toast.success("¡Creado!", {
        description: ` El reporte obligatorio ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el reporte obligatorio...",
      });
      console.log(error);
    },
  });
  return {
    createObligatoryReport: createMutation,
  };
};

export const useDeleteObligatoryReport = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ["obligatory-reports"],
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/transmandu/sms/obligatory-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danger-identifications"] });
      queryClient.invalidateQueries({ queryKey: ["obligatory-reports"] });
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
    deleteObligatoryReport: deleteMutation,
  };
};

export const useUpdateObligatoryReport = () => {
  const queryClient = useQueryClient();

  const updateObligatoryReportMutation = useMutation({
    mutationKey: ["obligatory-reports"],
    mutationFn: async (data: UpdateObligatoryReportData) => {
      await axiosInstance.patch(
        `/transmandu/sms/obligatory-reports/${data.id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obligatory-reports"] });
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
    updateObligatoryReport: updateObligatoryReportMutation,
  };
};
