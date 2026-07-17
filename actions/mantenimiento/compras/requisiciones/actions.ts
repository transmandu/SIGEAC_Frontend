import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreateRequisitionData } from "@/types/purchase"
import { buildRequisitionFormData, getRequisitionErrorMessage } from "@/lib/purchases/build-requisition-form-data"

export const useCreateRequisition = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateRequisitionData, company: string }) => {
      const formData = buildRequisitionFormData(data)
      await axiosInstance.post(`/${company}/requisition-order`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })

      toast.success("¡Creado!", {
        description: `La requisicion ha sido creada correctamente.`
      })
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: getRequisitionErrorMessage(error, 'No se pudo crear la requisicion...')
      })
      console.log(error)
    },
  })
  return {
    createRequisition: createMutation,
  }
}

export const useUpdateRequisition = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({ data, id, company }: { id: string | number, data: CreateRequisitionData, company: string }) => {
      const formData = buildRequisitionFormData(data)
      // Laravel can't parse multipart bodies on a native PUT request, so the
      // method is spoofed via _method and sent as POST instead.
      formData.append('_method', 'PUT')
      await axiosInstance.post(`/${company}/requisition-order/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
      toast.success("¡Actualizada!", {
        description: `La requisicion ha sido actualizada correctamente.`
      })
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: getRequisitionErrorMessage(error, 'No se pudo actualizar la requisicion...')
      })
      console.log(error)
    },
  })
  return {
    updateRequisition: updateMutation,
  }
}

type CreateRequisitionFromLowStockAlertParams =
  | { source: 'general', generalArticleId: number, company: string }
  | { source: 'consumable', articleId: number, company: string }

export const useCreateRequisitionFromLowStockAlert = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (params: CreateRequisitionFromLowStockAlertParams) => {
      const body = params.source === 'general'
        ? { general_article_id: params.generalArticleId }
        : { article_id: params.articleId }

      await axiosInstance.post(`/${params.company}/requisition-order/from-low-stock-alert`, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['low-stock-general-articles'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['low-stock-consumable-articles'], exact: false })

      toast.success("¡Solicitud creada!", {
        description: "Se generó una solicitud de compra para el artículo."
      })
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: getRequisitionErrorMessage(error, 'No se pudo crear la solicitud de compra...')
      })
    },
  })
  return {
    createRequisitionFromLowStockAlert: createMutation,
  }
}

export const useDeleteRequisition = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number, company: string }) => {
      await axiosInstance.delete(`/${company}/delete-requisition-order/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
      toast.success("¡Eliminado!", {
        description: `¡La requisición ha sido eliminada correctamente!`
      })
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la requisición!"
      })
    },
  })

  return {
    deleteRequisition: deleteMutation,
  }
}

export const useUpdateRequisitionPriority = () => {
  const queryClient = useQueryClient()

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, data, company }: {
      id: number,
      data: {
        priority?: string | null,
        articles?: { id: number, priority?: string | null }[],
        general_articles?: { id: number, priority?: string | null }[]
      },
      company: string
    }) => {
      await axiosInstance.put(`/${company}/requisition-order-update-priority/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
      toast.success("¡Actualizada!", {
        description: `¡La prioridad ha sido actualizada correctamente!`
      })
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al actualizar la prioridad!"
      })
    },
  })

  return {
    updatePriorityRequisition: updatePriorityMutation,
  }
}

export const useUpdateRequisitionStatus = () => {
  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, data, company }: {
      id: number,
      data: {
        status: string,
        updated_by: string,
        observation?: string | null
      },
      company: string
    }) => {
      await axiosInstance.put(`/${company}/requisition-order-update-status/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions-orders'] })
      queryClient.invalidateQueries({ queryKey: ['requisition-order'], exact: false })
      toast.success("¡Confirmada!", {
        description: `¡La requisición ha sido confirmada correctamente!`
      })
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al confirmar la requisición!"
      })
    },
  })

  return {
    updateStatusRequisition: updateStatusMutation,
  }
}