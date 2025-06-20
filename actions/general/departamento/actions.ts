import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface JobTitleFormSchema {
  id: number,
  acronym: string,
  name: string;
  email: string;
}

// Crear un cargo
export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JobTitleFormSchema) => {
      await axiosInstance.post("/job_titles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_titles"] });
      toast.success("¡Creado!", {
        description: "¡El cargo ha sido creado correctamente!",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al crear el cargo!",
      });
    },
  });
};

// Actualizar un cargo
export const useUpdateJobTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JobTitleFormSchema) => {
      await axiosInstance.put(`/job_titles/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_titles"] });
      toast.success("¡Actualizado!", {
        description: "¡El cargo ha sido actualizado correctamente!",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al actualizar el cargo!",
      });
    },
  });
};

// Eliminar un cargo
export const useDeleteJobTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/job_titles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_titles"] });
      toast.success("¡Eliminado!", {
        description: "¡El cargo ha sido eliminado correctamente!",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el cargo!",
      });
    },
  });
};
