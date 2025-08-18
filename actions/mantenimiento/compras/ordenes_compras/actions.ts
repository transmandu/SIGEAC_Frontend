import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface POArticles {
  article_part_number: string,
  article_purchase_order_id: number,
  usa_tracking: string,
  ock_tracking: string,
  article_location: string,
}

interface CreatePurchaseOrderData {
  status: string,
  justification: string,
  purchase_date: Date,
  sub_total: number,
  total: number,
  vendor_id: number,
  created_by: string,
  articles_purchase_orders: {
    batch: {
        name: string;
    };
    article_part_number: string;
    quantity: number;
    unit_price: string;
    image: string;
}[]
}

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
      mutationFn: async ({id, data, company}: {id: number, data: {
        tax: string,
        wire_fee: string,
        total: number,
        handling_fee: string,
        payment_method: string,
        ock_shipping: string,
        usa_shipping: string,
        observation?: string,
        bank_account_id: string,
        card_id?: string,
        invoice?: File,
        articles_purchase_orders: POArticles[]
      }, company: string}) => {
          await axiosInstance.put(`/${company}/purchase-order/${id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          toast.success("¡Confirmada!", {
              description: `¡La orden de compra ha sido actualizada correctamente!`
          })
        },
      onError: (e) => {
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
