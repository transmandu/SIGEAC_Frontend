import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DepartmentFormSchema {
  acronym: string;
  name: string;
  email: string;
}

// Crear un departamento
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: DepartmentFormSchema) =>
      await axiosInstance.post("/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("¡Creado!", {
        description: "¡El departamento ha sido creado correctamente!",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al crear el departamento!",
      });
    },
  });

  return { createDepartment: createMutation };
};

// Actualizar un departamento
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: DepartmentFormSchema) =>
      await axiosInstance.put(`/departments/${data}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("¡Actualizado!", {
        description: "¡El departamento ha sido actualizado correctamente!",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al actualizar el departamento!",
      });
    },
  });

  return { updateDepartment: updateMutation };
};

// Eliminar un departamento
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) =>
      await axiosInstance.delete(`/${company}/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("¡Eliminado!", {
        description: "¡El departamento ha sido eliminado correctamente!",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el departamento!",
      });
    },
  });

  return { deleteDepartment: deleteMutation };
};
