import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreateComplementaryQuoteData, CreateQuoteData, UpdateQuoteStatusData } from "@/types/purchase"

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
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
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

// Crea una cotización complementaria sobre una cotización general APROBADA,
// para documentar la diferencia entre lo realmente comprado y lo que la
// cadena original amparaba (p. ej. llegaron 24 unidades y solo se
// cotizaron/pagaron 6). Los documentos pagados no se tocan: la complementaria
// nace PENDING con justificación obligatoria y recorre el pipeline normal
// (aprobación → orden de compra → pago → entrega → intake).
export const useCreateComplementaryQuote = () => {
  const queryClient = useQueryClient()

  const createComplementaryMutation = useMutation({
    mutationFn: async ({
      quoteId,
      data,
      company,
    }: {
      quoteId: number
      company: string
      data: CreateComplementaryQuoteData
    }) => {
      await axiosInstance.post(`/${company}/quote/${quoteId}/complementary`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote'], exact: false })
      toast.success("¡Creada!", {
        description: "La cotización complementaria fue creada y queda pendiente de aprobación.",
      })
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description: error?.response?.data?.message || "No se pudo crear la cotización complementaria.",
      })
    },
  })

  return { createComplementaryQuote: createComplementaryMutation }
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
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
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

// Solo SUPERUSER (ver gating en el dropdown de acciones). Elimina la
// cotización junto con sus complementarias y cualquier orden de compra
// generada por cualquiera de ellas, revirtiendo el inventario ya afectado.
export const useCascadeDeleteQuote = () => {
  const queryClient = useQueryClient()

  const cascadeDeleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      await axiosInstance.delete(`/${company}/quote/${id}/cascade`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['general-article-intakes'], exact: false })
      toast.success("¡Eliminada en cascada!", {
        description: "La cotización y toda su cadena (complementarias, órdenes de compra e inventario asociado) fue eliminada.",
      })
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description: error?.response?.data?.message || "Hubo un error al eliminar en cascada la cotización.",
      })
    },
  })

  return { cascadeDeleteQuote: cascadeDeleteMutation }
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
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
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
