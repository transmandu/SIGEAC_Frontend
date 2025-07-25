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

// Crear un cargo
export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ company, data }: JobTitleFormSchema) =>
      await axiosInstance.post(`/${company}/job_titles`, data),
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

  return { createJobTitle: createMutation };
};

// Actualizar un cargo
export const useUpdateJobTitle = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ company, id, data }: UpdateJobTitleFormSchema) =>
      await axiosInstance.put(`/${company}/job_titles/${id}`, data),
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

  return { updateJobTitle: updateMutation };
};

// Eliminar un cargo
export const useDeleteJobTitle = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) =>
      await axiosInstance.delete(`/${company}/job_titles/${id}`),
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

  return { deleteJobTitle: deleteMutation };
};
