import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface JobTitleFormSchema {
  name: string;
  description: string;
  department: {
    id: number;
  };
}

// Crear un cargo
export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: JobTitleFormSchema) =>
      await axiosInstance.post("/job_titles", data),
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
    mutationFn: async (data: JobTitleFormSchema & { id: number }) =>
      await axiosInstance.put(`/job_titles/${data.id}`, data),
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
