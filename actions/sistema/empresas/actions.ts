import axiosInstance from "@/lib/axios"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { toast } from "sonner"

/* =========================
CREATE
========================= */
export const useCreateCompany = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post("/company", data)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies"],
      })

      toast("¡Creado!", {
        description: "¡La empresa ha sido creada correctamente!",
      })
    },

    onError: (error: any) => {
      toast("Error", {
        description:
          error?.response?.data?.message ??
          "No se pudo crear la empresa.",
      })
    },
  })

  return {
    createCompany: createMutation,
  }
}

/* =========================
UPDATE
========================= */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: FormData
    }) => {
      await axiosInstance.post(`/company/${id}?_method=PUT`, data)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })

      toast("¡Actualizado!", {
        description: "La empresa fue actualizada correctamente.",
      })
    },

    onError: (error: any) => {
      toast("Error", {
        description:
          error?.response?.data?.message ??
          "No se pudo actualizar la empresa.",
      })
    },
  })

  return { updateCompany: updateMutation }
}

/* =========================
DELETE
========================= */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/company/${id}`)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies"],
      })

      toast("¡Eliminado!", {
        description: "La empresa fue eliminada correctamente.",
      })
    },

    onError: (error: any) => {
      toast("Error", {
        description:
          error?.response?.data?.message ??
          "No se pudo eliminar la empresa.",
      })
    },
  })

  return {
    deleteCompany: deleteMutation,
  }
}