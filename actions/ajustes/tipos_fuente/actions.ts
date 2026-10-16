import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface InformationSourceSchema {
  company: string;
  data: {
    name: string;
    type: string;
  };
}

interface UpdateInformationSourceSchema {
  company: string;
  id: string;
  /** Actualización parcial: solo viajan los campos que cambiaron. */
  data: {
    name?: string;
    type?: string;
  };
}

export const useCreateInformationSource = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["information-sources"],
    mutationFn: async ({ company, data }: InformationSourceSchema) => {
      await axiosInstance.post(`/${company}/information-sources`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information-sources"] });
      toast.success("¡Creado!", {
        description: ` La fuente de informacion ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "No se pudo crear la fuente..."),
      });
    },
  });
  return {
    createInformationSource: createMutation,
  };
};

export const useDeleteInformationSource = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | undefined;
      id: number | string;
    }) => {
      await axiosInstance.delete(`/${company}/information-sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information-sources"] });
      toast.success("¡Eliminado!", {
        description: `¡La fuente ha sido eliminada correctamente!`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "¡Hubo un error al eliminar la fuente!",
        ),
      });
    },
  });

  return {
    deleteInformationSource: deleteMutation,
  };
};

export const useUpdateInformationSource = () => {
  const queryClient = useQueryClient();

  const updateInformationSourceMutation = useMutation({
    mutationKey: ["information-sources"],
    mutationFn: async ({
      company,
      id,
      data,
    }: UpdateInformationSourceSchema) => {
      await axiosInstance.put(`/${company}/information-sources/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information-sources"] });
      toast.success("¡Actualizado!", {
        description: `La fuente ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "No se pudo actualizar la fuente...",
        ),
      });
    },
  });
  return {
    updateInformationSource: updateInformationSourceMutation,
  };
};
