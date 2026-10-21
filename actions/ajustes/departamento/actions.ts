import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { notifyError } from "@/lib/notify-error";

interface DepartmentFormSchema {
  acronym: string
  name: string
  email: string
  company?: string
}

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: DepartmentFormSchema) =>
      await axiosInstance.post("/departments", data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })

      toast.success("¡Creado!", {
        description: "El departamento ha sido creado correctamente!",
      })
    },

    onError: (error) => {
      notifyError(error, { action: "crear el departamento" })
    },
  })

  return { createDepartment: createMutation }
}

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async (
      data: DepartmentFormSchema & { id: number }
    ) =>
      await axiosInstance.put(`/departments/${data.id}`, {
        acronym: data.acronym,
        name: data.name,
        email: data.email,
        company: data.company,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })

      toast.success("¡Actualizado!", {
        description: "El departamento ha sido actualizado correctamente!",
      })
    },

    onError: (error) => {
      notifyError(error, { action: "actualizar el departamento" })
    },
  })

  return { updateDepartment: updateMutation }
}

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) =>
      await axiosInstance.delete(`/${company}/departments/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })

      toast.success("¡Eliminado!", {
        description: "El departamento ha sido eliminado correctamente!",
      })
    },

    onError: (error) => {
      notifyError(error, { action: "eliminar el departamento" })
    },
  })

  return { deleteDepartment: deleteMutation }
}