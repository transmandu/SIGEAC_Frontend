import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BulletinData {
  company: string;
  data: {
    date: Date;
    title: string;
    description: string;
    image?: File | undefined;
    document: File | undefined;
  };
}

interface UpdateBulletinData {
  company: string;
  id: number | string;
  data: {
    date: Date;
    title: string;
    description: string;
    image?: File | undefined;
    document: File | undefined;
  };
}

export const useCreateBulletin = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ data, company }: BulletinData) => {
      await axiosInstance.post(`/${company}/sms/bulletin`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["safety-bulletins", data.company],
      });
      toast.success("¡Creado!", {
        description: ` El boletin ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el boletin...",
      });
      console.log(error);
    },
  });
  return {
    createBulletin: createMutation,
  };
};

export const useDeleteSafetyBulletin = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: string }) => {
      await axiosInstance.delete(`/${company}/sms/bulletin/${id}`);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["safety-bulletins", data.company],
      });
      toast.success("¡Eliminado!", {
        description: `¡El boletin ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar un boletin!",
      });
    },
  });

  return {
    deleteSafetyBulletin: deleteMutation,
  };
};

export const useUpdateBulletin = () => {
  const queryClient = useQueryClient();
  const updateBulletinMutation = useMutation({
    mutationKey: ["bulletin"],
    mutationFn: async ({ company, data, id }: UpdateBulletinData) => {
      await axiosInstance.post(`/${company}/sms/bulletin/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["safety-bulletins", data.company],
      });
      toast.success("¡Actualizado!", {
        description: `El boletin ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el boletin...",
      });
      console.log(error);
    },
  });
  return {
    updateBulletin: updateBulletinMutation,
  };
};
