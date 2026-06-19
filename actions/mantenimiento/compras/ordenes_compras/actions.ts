import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreatePurchaseOrderData, UpdatePurchaseOrderData } from "@/types/purchase"

export const useCreatePurchaseOrder = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreatePurchaseOrderData, company: string}) => {
          await axiosInstance.post(`/${company}/purchase-order`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          queryClient.invalidateQueries({queryKey: ['purchase-order'], exact: false})
          toast.success("¡Creado!", {
              description: `La orden de compra ha sido creada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo crear la orden de compra...'
          })
          console.log(error)
        },
      }
  )
  return {
    createPurchaseOrder: createMutation,
  }
}

export const useCompletePurchase = () => {

  const queryClient = useQueryClient()

  const completePurchaseMutation = useMutation({
      mutationFn: async ({id, data, company}: {id: number, data: UpdatePurchaseOrderData, company: string}) => {
          await axiosInstance.put(`/${company}/purchase-order/${id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          queryClient.invalidateQueries({queryKey: ['purchase-order'], exact: false})
          toast.success("¡Confirmada!", {
              description: `¡La orden de compra ha sido actualizada correctamente!`
          })
        },
      onError: () => {
          toast.error("Oops!", {
            description: "¡Hubo un error al actualizar la orden de compra!"
        })
        },
      }
  )

  return {
    completePurchase: completePurchaseMutation,
  }
}

export const useMarkPurchaseOrderAsPaid = () => {

  const queryClient = useQueryClient()

  const markAsPaidMutation = useMutation({
      mutationFn: async ({id, company}: {id: number, company: string}) => {
          const {data} = await axiosInstance.put(`/${company}/purchase-order/${id}/pay`)
          return data
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          queryClient.invalidateQueries({queryKey: ['purchase-order'], exact: false})
          toast.success("¡Pagada!", {
              description: `La orden de compra ha sido marcada como pagada.`
          })
        },
      onError: () => {
          toast.error("Oops!", {
            description: "¡Hubo un error al marcar la orden de compra como pagada!"
        })
        },
      }
  )

  return {
    markPurchaseOrderAsPaid: markAsPaidMutation,
  }
}

export const useMarkPurchaseOrderAsCompleted = () => {

  const queryClient = useQueryClient()

  const markAsCompletedMutation = useMutation({
      mutationFn: async ({id, company}: {id: number, company: string}) => {
          const {data} = await axiosInstance.put(`/${company}/purchase-order/${id}/complete`)
          return data
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          queryClient.invalidateQueries({queryKey: ['purchase-order'], exact: false})
          toast.success("¡Completada!", {
              description: `La orden de compra ha sido marcada como completada.`
          })
        },
      onError: () => {
          toast.error("Oops!", {
            description: "¡Hubo un error al marcar la orden de compra como completada!"
        })
        },
      }
  )

  return {
    markPurchaseOrderAsCompleted: markAsCompletedMutation,
  }
}

export const useDeleteQuote = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number, company: string}) => {
          await axiosInstance.post(`/${company}/delete-quote/${id}`, {company})
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          toast.success("¡Eliminado!", {
              description: `¡La cotización ha sido eliminada correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la cotizacion!"
        })
        },
      }
  )

  return {
    deleteQuote: deleteMutation,
  }
}
