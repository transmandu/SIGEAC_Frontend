import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface DepartmentFormSchema {
  acronym: string
  name: string
  email: string
  company?: string
}

/* =========================
   CREATE
========================= */
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

    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al crear el departamento!",
      })
    },
  })

  return { createDepartment: createMutation }
}

/* =========================
   UPDATE (CORREGIDO)
========================= */
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

    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al actualizar el departamento!",
      })
    },
  })

  return { updateDepartment: updateMutation }
}

/* =========================
   DELETE
========================= */
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

    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al eliminar el departamento!",
      })
    },
  })

  return { deleteDepartment: deleteMutation }
}