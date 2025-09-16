import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SMSActivityData {
  activity_name: string;
  activity_number: string;
  start_date: Date;
  end_date: Date;
  start_time: string;
  end_time: string;
  place: string;
  topics: string;
  objetive: string;
  description: string;
  authorized_by: string;
  planned_by: string;
  executed_by: string;
}
interface updateSMSActivityData {
  company: string | null;
  id: string;
  data: {
    activity_name: string;
    activity_number: string;
    start_date: Date;
    end_date: Date;
    start_time: string;
    end_time: string;
    place: string;
    topics: string;
    objetive: string;
    description: string;
    authorized_by: string;
    planned_by: string;
    executed_by: string;
    status: string;
  };
}

export const useCreateSMSActivity = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string | null;
      data: SMSActivityData;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/sms/activities`,
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
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string;
    }) => {
      await axiosInstance.delete(`/${company}/sms/activities/${id}`);
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
    mutationFn: async ({ company, id, data }: updateSMSActivityData) => {
      const response = await axiosInstance.patch(
        `/${company}/sms/activities/${id}`,
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

export const useUpdateCalendarSMSActivity = () => {
  const queryClient = useQueryClient();

  const updateSMSActivityMutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: string;
      data: any;
    }) => {
      if (data.status === "CERRADO") {
        throw new Error(
          "No se puede actualizar la actividad de un curso con estatus CERRADO."
        );
      }
      const response = await axiosInstance.patch(
        `/${company}/sms/update-calendar-activity/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-calendar-activities"] });
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
    updateCalendarSMSActivity: updateSMSActivityMutation,
  };
};

export const useCloseSMSActivity = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const closeSMSActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.patch(
        `/${selectedCompany?.slug}/sms/close-sms-activity/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] });
      toast.success("Cerrado", {
        description: `La actividad se ha cerrado.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo cerrar la actividad...",
      });
      console.log(error);
    },
  });
  return {
    closeSMSActivity: closeSMSActivityMutation,
  };
};
