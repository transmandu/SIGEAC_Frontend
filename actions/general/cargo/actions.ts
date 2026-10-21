import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

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
    onError: (error) => {
      notifyError(error, { action: "crear el cargo" });
    },
  });

  return { createJobTitle: createMutation };
};

export const useUpdateJobTitle = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ company, id, data }: UpdateJobTitleFormSchema) =>
      await axiosInstance.put(`/${company}/job-titles/${id}`, data),
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: ["job_titles", company] });
      queryClient.invalidateQueries({ queryKey: ["employees", company] });
      queryClient.invalidateQueries({
        queryKey: ["employees-inactive", company],
      });
      toast.success("¡Actualizado!", {
        description: "¡El cargo ha sido actualizado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el cargo" });
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
    onError: (error: any) => {
      notifyError(error, {
        action: "eliminar el cargo! Puede que tenga empleados asignados",
      });
    },
  });

  return { deleteJobTitle: deleteMutation };
};
