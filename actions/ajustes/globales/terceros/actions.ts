import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ThirdPartySchema {
  name: string;
  type: string;
}


export const useCreateThirdParty = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["third-parties"],
    mutationFn: async (data: ThirdPartySchema) => {
      await axiosInstance.post(`/third-parties`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-parties"] });
      toast.success("¡Creado!", {
        description: ` El tercero ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el tercero...",
      });
      console.log(error);
    },
  });
  return {
    createThirdParty: createMutation,
  };
};

export const useUpdateThirdParty = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: Partial<ThirdPartySchema>;
    }) => {
      await axiosInstance.put(`/third-parties/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-parties"] });
      toast.success("¡Actualizado!", {
        description: `El tercero ha sido actualizado correctamente.`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al actualizar el tercero!",
      });
    },
  });

  return {
    updateThirdParty: updateMutation,
  };
};

export const useDeleteThirdParty = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/third-parties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-parties"] });
      toast.success("¡Eliminado!", {
        description: `¡El tercero ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar un tercero!",
      });
    },
  });

  return {
    deleteThirdParty: deleteMutation,
  };
};
