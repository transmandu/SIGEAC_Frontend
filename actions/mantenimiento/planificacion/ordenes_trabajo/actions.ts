import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface CreateWOData {
  description: string,
  elaborated_by: string,
  reviewed_by: string,
  approved_by: string,
  date: string,
  aircraft_id: string,
  location_id: string,
  work_order_task?: {
    description_task: string,
    ata: string,
    task_number: string,
    origin_manual: string,
    task_items?: {
      part_number: string,
      alternate_part_number?: string,
      serial?: string,
    }[]
  }[]
}

export const useCreateWorkOrder = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreateWOData, company: string}) => {
          await axiosInstance.post(`/${company}/work-orders`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
          toast.success("¡Creado!", {
              description: `La orden de trabajo ha sido registrado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo registrar la orden de trabajo...'
          })
          console.log(error)
        },
      }
  )
  return {
    createWorkOrder: createMutation,
  }
}

export const useDeleteWorkOrder = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number | string, company: string}) => {
          await axiosInstance.delete(`/${company}/work-orders/${id}`)
        },
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
        queryClient.invalidateQueries({queryKey: ['work-order'], exact: false})
          toast.success("¡Eliminado!", {
              description: `¡La orden de trabajo ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la orden de trabajo!"
        })
        },
      }
  )

  return {
    deleteWorkOrder: deleteMutation,
  }
}


export const useUpdateWorkOrderTaskStatus = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({task_id, status, company}: {task_id: string, status: string, company: string}) => {
          await axiosInstance.put(`/${company}/update-status-work-order-task/${task_id}`, {status})
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-order'], exact: false})
          toast.success("¡Creado!", {
              description: `La tarea ha cerrada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo cerrar la tarea...'
          })
          console.log(error)
        },
      }
  )
  return {
    updateTaskStatus: updateMutation,
  }
}

export const useUpdateWorkOrderTask = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({data, company}: {data: {
        id: string,
        inspector_responsable?: string,
        technician_responsable?: string,
      }, company: string}) => {
          await axiosInstance.put(`/${company}/update-work-order-task/${data.id}`, data)
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
    updateWorkOrderTask: updateMutation,
  }
}
