import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreateRequisitionData } from "@/types/purchase"

export const useCreateRequisition = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateRequisitionData, company: string }) => {
      await axiosInstance.post(`/${company}/requisition-order`, data, {
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
        description: 'No se pudo crear la requisicion...'
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
      await axiosInstance.put(`/${company}/requisition-order/${id}`, data)
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
        description: 'No se pudo actualizar la requisicion...'
      })
      console.log(error)
    },
  })
  return {
    updateRequisition: updateMutation,
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