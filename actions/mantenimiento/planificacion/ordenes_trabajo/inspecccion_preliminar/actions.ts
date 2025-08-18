import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

interface CreatePrelimInspection {
  work_order_id: string,
  authorizing: string,
  observation: string,
}

export const useCreatePrelimInspection = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreatePrelimInspection, company: string}) => {
          await axiosInstance.post(`/${company}/preliminary-inspection`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-order'], exact: false})
          queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
          toast.success("¡Creado!", {
              description: `La inspección preliminar ha sido creada correctamente.`
          })
        },
      onError: (error: AxiosError) => {
        console.log(error)
          toast.error('Oops!', {
            description: 'No se pudo crear la inspección preliminar...'})
        },
      }
  )
  return {
    createPrelimInspection: createMutation,
  }
}


export const useAddPrelimItem = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({data, company}: {data: {
        id: string,
        ata: string,
        description: string,
        location: string,
      }, company: string}) => {
          await axiosInstance.post(`/${company}/preliminary-inspection-items/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
          queryClient.invalidateQueries({queryKey: ['work-order'], exact: false})
          toast.success("¡Creado!", {
              description: `La tarea ha sido actualizada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizada la tarea...'
          })
        },
      }
  )
  return {
    updateAddInspectionItem: updateMutation,
  }
}

export const useUpdatePrelimInspection = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({data, company}: {data: {
        id: string,
        status: string,
      }, company: string}) => {
          await axiosInstance.patch(`/${company}/preliminary-inspection/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
          queryClient.invalidateQueries({queryKey: ['work-order'], exact: false})
          toast.success("¡Creado!", {
              description: `La inspección ha sido actualizada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizada la inspección...'
          })
        },
      }
  )
  return {
    updatePrelimInspection: updateMutation,
  }
}
