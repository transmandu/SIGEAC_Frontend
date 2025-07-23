import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FollowUpControlData {
  company: string | null;
  data: {
    description: string;
    date: Date;
    mitigation_measure_id: number | string;
    image?: File | string;
    document?: File | string;
  };
}

interface updateFolllowUpControlData {
  company: string | null;
  id: string;
  data: {
    description: string;
    date: Date;
    mitigation_measure_id: string | number;
    image?: File | string;
    document?: File | string;
  };
}

export const useCreateFollowUpControl = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ data, company }: FollowUpControlData) => {
      await axiosInstance.post(`/${company}/sms/follow-up-controls`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-controls"] });
      queryClient.invalidateQueries({ queryKey: ["mitigation-measures"] });
      toast.success("¡Creado!", {
        description: `El cotrol de seguimiento ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el control de seguimiento...",
      });
      console.log(error);
    },
  });
  return {
    createFollowUpControl: createMutation,
  };
};

export const useDeleteFollowUpControl = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string;
    }) => {
      await axiosInstance.delete(`/${company}/sms/follow-up-controls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-controls"] });
      toast.success("¡Eliminado!", {
        description: `¡El control de seguimiento ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el control de seguimiento!",
      });
    },
  });

  return {
    deleteFollowUpControl: deleteMutation,
  };
};

export const useUpdateFollowUpControl = () => {
  const queryClient = useQueryClient();

  const updateFollowUpControlMutation = useMutation({
    mutationFn: async ({ company, id, data }: updateFolllowUpControlData) => {
      await axiosInstance.post(
        `/${company}/sms/update-follow-up-controls/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-controls"] });
      toast.success("¡Actualizado!", {
        description: `El control ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el control de seguimiento...",
      });
      console.log(error);
    },
  });
  return {
    updateFollowUpControl: updateFollowUpControlMutation,
  };
};
