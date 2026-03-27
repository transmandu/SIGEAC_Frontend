import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

interface SMSActivityData {
  activity_name: string;
  title: string;
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
  executed_by?: string;
  image?: File;
  document?: File;
}
interface updateSMSActivityData {
  company: string | null;
  id: string;
  data: {
    activity_name: string;
    title: string;
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
    executed_by?: string;
    status: string;
    image?: File | string;
    document?: File | string;
  };
}
interface NextActivityNumber {
  next_number: string;
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
      const formData = new FormData();
      formData.append("activity_name", data.activity_name);
      formData.append("title", data.title);
      formData.append("activity_number", data.activity_number);
      formData.append(
        "start_date",
        format(new Date(data.start_date), "yyyy-MM-dd"),
      );
      formData.append(
        "end_date",
        format(new Date(data.end_date), "yyyy-MM-dd"),
      );
      formData.append("start_time", data.start_time);
      formData.append("end_time", data.end_time);
      formData.append("place", data.place);
      formData.append("topics", data.topics);
      formData.append("objetive", data.objetive);
      formData.append("description", data.description);
      formData.append("authorized_by", data.authorized_by);
      formData.append("planned_by", data.planned_by);
      if (data.executed_by) formData.append("executed_by", data.executed_by);
      if (data.image instanceof File) formData.append("image", data.image);
      if (data.document instanceof File)
        formData.append("document", data.document);

      const response = await axiosInstance.post(
        `/${company}/sms/activities`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
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
      const formData = new FormData();
      // Spoofing PATCH via POST since multipart/form-data doesn't work with PATCH in some servers
      formData.append("_method", "PATCH");
      formData.append("activity_name", data.activity_name);
      formData.append("title", data.title);
      formData.append("activity_number", data.activity_number);
      formData.append(
        "start_date",
        format(new Date(data.start_date), "yyyy-MM-dd"),
      );
      formData.append(
        "end_date",
        format(new Date(data.end_date), "yyyy-MM-dd"),
      );
      formData.append("start_time", data.start_time);
      formData.append("end_time", data.end_time);
      formData.append("place", data.place);
      formData.append("topics", data.topics);
      formData.append("objetive", data.objetive);
      formData.append("description", data.description);
      formData.append("authorized_by", data.authorized_by);
      formData.append("planned_by", data.planned_by);
      formData.append("status", data.status);
      if (data.executed_by) formData.append("executed_by", data.executed_by);
      if (data.image instanceof File) formData.append("image", data.image);
      if (data.document instanceof File)
        formData.append("document", data.document);

      const response = await axiosInstance.post(
        `/${company}/sms/activities/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] });
      queryClient.invalidateQueries({ queryKey: ["sms-activity", data.id] });
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
          "No se puede actualizar la actividad de un curso con estatus CERRADO.",
        );
      }
      const response = await axiosInstance.patch(
        `/${company}/sms/update-calendar-activity/${id}`,
        data,
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
        `/${selectedCompany?.slug}/sms/close-sms-activity/${id}`,
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

export const useOpenSMSActivity = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  const openSMSActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      // Ajusta esta URL según tu API (ej. /open-sms-activity o similar)
      const response = await axiosInstance.patch(
        `/${selectedCompany?.slug}/sms/open-sms-activity/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] });
      toast.success("Reabierta", {
        description: `La actividad se ha vuelto a abrir correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo reabrir la actividad...",
      });
      console.log(error);
    },
  });

  return {
    openSMSActivity: openSMSActivityMutation,
  };
};

export const useGetNextActivityNumber = (company: string | null) => {
  return useQuery<NextActivityNumber>({
    queryKey: ["next-activity-number", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/next-activity-number`,
      );
      return data;
    },
    enabled: !!company,
    staleTime: 5000,
    retry: 1,
  });
};
