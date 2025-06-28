import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SMSActivityData {
  activity_name: string;
  activity_number: string;
  start_date: Date;
  end_date: Date;
  hour: string;
  duration: string;
  place: string;
  topics: string;
  objetive: string;
  description: string;
  authorized_by: string;
  planned_by: string;
  executed_by: string;
}
interface updateSMSActivityData {
  id: string;
  activity_name: string;
  activity_number: string;
  start_date: Date;
  end_date: Date;
  hour: string;
  duration: string;
  place: string;
  topics: string;
  objetive: string;
  description: string;
  authorized_by: string;
  planned_by: string;
  executed_by: string;
  status: string;
}

export const useCreateSMSActivity = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: SMSActivityData) => {
      const response = await axiosInstance.post(
        "/transmandu/sms/sms-activities",
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
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] });
      toast.success("¡Creado!", {
        description: `La Actividad ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la actividad...",
      });
      console.log(error);
    },
  });
  return {
    createSMSActivity: createMutation,
  };
};

export const useDeleteSMSActivity = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/transmandu/sms/sms-activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] }); // No se cual key va aca pero estoy seguro que no es esa
      toast.success("¡Eliminado!", {
        description: `¡La actividad ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la actividad!",
      });
    },
  });

  return {
    deleteSMSActivity: deleteMutation,
  };
};

export const useUpdateSMSActivity = () => {
  const queryClient = useQueryClient();

  const updateSMSActivityMutation = useMutation({
    mutationFn: async (data: updateSMSActivityData) => {
      const response = await axiosInstance.patch(
        `/transmandu/sms/sms-activities/${data.id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] });
      toast.success("¡Actualizado!", {
        description: `La actividad ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la actividad...",
      });
      console.log(error);
    },
  });
  return {
    updateSMSActivity: updateSMSActivityMutation,
  };
};
