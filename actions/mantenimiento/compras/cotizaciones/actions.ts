import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreateQuoteData, UpdateQuoteStatusData } from "@/types/purchase"

export const useCreateQuote = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateQuoteData; company?: string }) => {
      await axiosInstance.post(`/${company}/quote`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      toast.success("¡Creado!", {
        description: "La cotización ha sido creada correctamente.",
      })
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo crear la cotización.",
      })
    },
  })

  return { createQuote: createMutation }
}

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number
      company: string
      data: UpdateQuoteStatusData
    }) => {
      await axiosInstance.put(`/${company}/quote-order-update-status/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      toast.success("¡Confirmada!", {
        description: "La cotización ha sido actualizada correctamente.",
      })
    },
    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al actualizar la cotización.",
      })
    },
  })

  return { updateStatusQuote: updateStatusMutation }
}

export const useDeleteQuote = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      await axiosInstance.delete(`/${company}/delete-quote/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      toast.success("¡Eliminado!", {
        description: "La cotización ha sido eliminada correctamente.",
      })
    },
    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al eliminar la cotización.",
      })
    },
  })

  return { deleteQuote: deleteMutation }
}
