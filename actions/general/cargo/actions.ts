import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface JobTitleFormSchema {
  company: string;
  data: { name: string; description: string };
}

interface UpdateJobTitleFormSchema {
  company: string;
  id: string;
  data: { name: string; description: string };
}

export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ company, data }: JobTitleFormSchema) =>
      await axiosInstance.post(`/${company}/job-titles`, data),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: ["job_titles", company] });
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

  return { createJobTitle: createMutation };
};

export const useUpdateJobTitle = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    // El backend expone el update sin prefijo de empresa, a diferencia del resto.
    mutationFn: async ({ id, data }: UpdateJobTitleFormSchema) =>
      await axiosInstance.put(`/job-titles/${id}`, data),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: ["job_titles", company] });
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

  return { updateJobTitle: updateMutation };
};

export const useDeleteJobTitle = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) =>
      await axiosInstance.delete(`/${company}/job-titles/${id}`),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: ["job_titles", company] });
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

  return { deleteJobTitle: deleteMutation };
};
