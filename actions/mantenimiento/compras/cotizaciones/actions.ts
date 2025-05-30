import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateQuoteData {
    justification: string,
    articles: {
      part_number: string,
      quantity: number,
      unit: string,
      unit_price: string,
    }[],
    sub_total: number,
    total: number,
    vendor_id: number,
    requisition_order_id: number,
    location_id: number,
    quote_date: Date,
    created_by: string,
    company: string,
}

export const useCreateQuote = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async (data: CreateQuoteData) => {
          await axiosInstance.post('/quote', data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['quotes']})
          queryClient.invalidateQueries({queryKey: ['quote'], exact: false})
          toast.success("¡Creado!", {
              description: `La cotizacion ha sido creada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo crear la cotizacion...'
          })
          console.log(error)
        },
      }
  )
  return {
    createQuote: createMutation,
  }
}

export const useUpdateQuoteStatus = () => {

  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
      mutationFn: async ({id, data}: {id: number, data: {
        status: string,
        updated_by: string,
        company: string,
      }}) => {
          await axiosInstance.put(`/quote-order-update-status/${id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['quotes']})
          toast.success("¡Confirmada!", {
              description: `¡La cotizacion ha sido actualizada correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al actualizar la cotización!"
        })
        },
      }
  )

  return {
    updateStatusQuote: updateStatusMutation,
  }
}

export const useDeleteQuote = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number, company: string}) => {
          await axiosInstance.post(`/delete-quote/${id}`, {company})
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['quotes']})
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
