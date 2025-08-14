import axiosInstance from "@/lib/axios"
import { ConsumableArticle } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateRequisitionData {
  justification: string,
  requested_by: string,
  created_by: number | string,
  aircraft_id?: string,
  work_order_id?: string,
  type: string,
  image?: File,
  articles: {
    batch: string,
    batch_name: string,
    batch_articles: {
      quantity: number,
      part_number?: string,
      alt_part_number?: string,
      pma?: string,
      unit?: string | number,
      image?: File,
    }[]
  }[]
}

export const useCreateRequisition = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreateRequisitionData, company: string}) => {
          await axiosInstance.post(`/${company}/requisition-order`, data,
            {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          queryClient.invalidateQueries({queryKey: ['requisitions-order'], exact: false})

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
      }
  )
  return {
    createRequisition: createMutation,
  }
}

export const useUpdateRequisition = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({data, id, company}: {id: string | number, data: CreateRequisitionData, company: string}) => {
          await axiosInstance.put(`/${company}/requisition-order/${id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
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
      }
  )
  return {
    updateRequisition: updateMutation,
  }
}

export const useDeleteRequisition = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number, company: string}) => {
          await axiosInstance.delete(`/${company}/delete-requisition-order/${id}`)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          toast.success("¡Eliminado!", {
              description: `¡La requisición ha sido eliminada correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la requisición!"
        })
        },
      }
  )

  return {
    deleteRequisition: deleteMutation,
  }
}

export const useUpdateRequisitionStatus = () => {

  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
      mutationFn: async ({id, data, company}: {id: number, data: {
        status: string,
        updated_by: string,
      }, company: string}) => {
          await axiosInstance.put(`/${company}/requisition-order-update-status/${id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['requisitions-orders']})
          toast.success("¡Confirmada!", {
              description: `¡La requisición ha sido confirmada correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al confirmar la requisición!"
        })
        },
      }
  )

  return {
    updateStatusRequisition: updateStatusMutation,
  }
}
