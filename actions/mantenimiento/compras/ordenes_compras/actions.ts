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
          queryClient.invalidateQueries({queryKey: ['purchaseOrderByQuote'], exact: false})
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
          const formData = new FormData()
          formData.append("_method", "PUT")

          if (data.tax != null) formData.append("tax", String(data.tax))
          if (data.wire_fee != null) formData.append("wire_fee", String(data.wire_fee))
          if (data.handling_fee != null) formData.append("handling_fee", String(data.handling_fee))
          formData.append("total", String(data.total))
          if (data.bank_account_id != null) formData.append("bank_account_id", String(data.bank_account_id))
          if (data.card_id != null) formData.append("card_id", String(data.card_id))
          if (data.shipping_fee != null) formData.append("shipping_fee", String(data.shipping_fee))
          if (data.shipping_agency_id != null) formData.append("shipping_agency_id", String(data.shipping_agency_id))
          if (data.international_shipping != null) formData.append("international_shipping", String(data.international_shipping))
          if (data.invoice_number != null) formData.append("invoice_number", data.invoice_number)
          if (data.observation != null) formData.append("observation", data.observation)
          if (data.invoice) formData.append("invoice", data.invoice)

          data.articles_purchase_orders?.forEach((article, index) => {
            formData.append(`articles_purchase_orders[${index}][article_purchase_order_id]`, String(article.article_purchase_order_id))
            if (article.shipping_tracking != null) formData.append(`articles_purchase_orders[${index}][shipping_tracking]`, article.shipping_tracking)
            if (article.international_shipping_tracking != null) formData.append(`articles_purchase_orders[${index}][international_shipping_tracking]`, article.international_shipping_tracking)
          })

          await axiosInstance.post(`/${company}/purchase-order/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
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
