import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreatePurchaseOrderData, UpdatePurchaseOrderData, RegisterGeneralArticlesDeliveryResponse } from "@/types/purchase"

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
          // Crear la OC aprueba la cotización y avanza la requisición en el
          // backend, así que refrescamos esas vistas también.
          queryClient.invalidateQueries({queryKey: ['quotes']})
          queryClient.invalidateQueries({queryKey: ['quote'], exact: false})
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          queryClient.invalidateQueries({queryKey: ['requisition-order'], exact: false})
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
          if (data.sub_total != null) formData.append("sub_total", String(data.sub_total))
          formData.append("total", String(data.total))
          // El backend deriva bank_account_id del método de pago cuando se
          // envía payment_method_id; bank_account_id suelto queda por
          // compatibilidad con órdenes previas a la reingeniería de pagos.
          if (data.payment_method_id != null) formData.append("payment_method_id", String(data.payment_method_id))
          if (data.bank_account_id != null) formData.append("bank_account_id", String(data.bank_account_id))
          if (data.bank_card_id != null) formData.append("bank_card_id", String(data.bank_card_id))
          if (data.shipping_fee != null) formData.append("shipping_fee", String(data.shipping_fee))
          if (data.shipping_agency_id != null) formData.append("shipping_agency_id", String(data.shipping_agency_id))
          if (data.international_shipping != null) formData.append("international_shipping", String(data.international_shipping))
          if (data.invoice_number != null) formData.append("invoice_number", data.invoice_number)
          if (data.observation != null) formData.append("observation", data.observation)
          if (data.invoice) formData.append("invoice", data.invoice)

          data.articles_purchase_orders?.forEach((article, index) => {
            formData.append(`articles_purchase_orders[${index}][article_purchase_order_id]`, String(article.article_purchase_order_id))
            if (article.total != null) formData.append(`articles_purchase_orders[${index}][total]`, String(article.total))
            if (article.total_justification != null) formData.append(`articles_purchase_orders[${index}][total_justification]`, article.total_justification)
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
          queryClient.invalidateQueries({queryKey: ['quotes']})
          queryClient.invalidateQueries({queryKey: ['quote'], exact: false})
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          queryClient.invalidateQueries({queryKey: ['requisition-order'], exact: false})
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
          queryClient.invalidateQueries({queryKey: ['quotes']})
          queryClient.invalidateQueries({queryKey: ['quote'], exact: false})
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          queryClient.invalidateQueries({queryKey: ['requisition-order'], exact: false})
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

// Destino de la entrega: por defecto el almacén (warehouseId, de tipo GENERAL
// en la estación activa) — intake PENDING que el almacén confirma. Si en
// cambio se afilia a un departamento/empleado/autorizado/tercero (mismas
// entidades que la requisición general), la entrega es directa: el intake nace
// DELIVERED, nunca entra al inventario y su comprobante es la Nota de Entrega.
export type GeneralArticlesDeliveryDestination = {
  locationId?: string | number
  warehouseId?: number
  departmentId?: number
  employeeId?: number
  authorizedEmployeeId?: number
  thirdPartyId?: number
}

// El responsable de traer la mercancía llama esto cuando los artículos
// generales de la orden llegan físicamente. Crea un GeneralArticleIntake en
// PENDING por cada ítem general que aún no tenga uno (seguro de llamar más
// de una vez sobre la misma orden, p. ej. entregas parciales/escalonadas).
// Pagar la orden (useMarkPurchaseOrderAsPaid) ya NO dispara esto automáticamente.
export const useRegisterGeneralArticlesDelivery = () => {

  const queryClient = useQueryClient()

  const registerDeliveryMutation = useMutation({
      mutationFn: async ({id, company, arrivedAt, generalArticlePurchaseOrderIds, destination}: {id: number, company: string, arrivedAt?: Date, generalArticlePurchaseOrderIds?: number[], destination?: GeneralArticlesDeliveryDestination}) => {
          const {data} = await axiosInstance.patch<RegisterGeneralArticlesDeliveryResponse>(
            `/${company}/purchase-order/${id}/register-general-articles-delivery`,
            {
              ...(arrivedAt ? { arrived_at: arrivedAt.toISOString() } : {}),
              ...(generalArticlePurchaseOrderIds ? { general_article_purchase_order_ids: generalArticlePurchaseOrderIds } : {}),
              ...(destination?.locationId ? { location_id: Number(destination.locationId) } : {}),
              ...(destination?.warehouseId ? { warehouse_id: destination.warehouseId } : {}),
              ...(destination?.departmentId ? { department_id: destination.departmentId } : {}),
              ...(destination?.employeeId ? { employee_id: destination.employeeId } : {}),
              ...(destination?.authorizedEmployeeId ? { authorized_employee_id: destination.authorizedEmployeeId } : {}),
              ...(destination?.thirdPartyId ? { third_party_id: destination.thirdPartyId } : {}),
            }
          )
          return data
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['purchase-orders']})
          queryClient.invalidateQueries({queryKey: ['purchase-order'], exact: false})
          queryClient.invalidateQueries({queryKey: ['general-article-intakes'], exact: false})
          toast.success("¡Entrega registrada!", {
              description: `Se registró la entrega de los artículos generales de la orden de compra.`
          })
        },
      onError: (error: any) => {
          toast.error("Oops!", {
            description: error?.response?.data?.message || "¡Hubo un error al registrar la entrega de los artículos generales!"
        })
        },
      }
  )

  return {
    registerGeneralArticlesDelivery: registerDeliveryMutation,
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
          queryClient.invalidateQueries({queryKey: ['quotes']})
          queryClient.invalidateQueries({queryKey: ['quote'], exact: false})
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          queryClient.invalidateQueries({queryKey: ['requisition-order'], exact: false})
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
