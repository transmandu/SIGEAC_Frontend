import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

interface CreateNoRutineData {
  description: string,
  work_order_task_id: string,
  ata: string,
  action?: string,
  inspector_responsable: string,
  needs_task: boolean,
  task?: {
    description_task: string,
    ata: string,
    task_number: string,
    origin_manual: string,
    task_items?: {
      part_number: string,
      alternate_part_number?: string,
      serial?: string,
    }[]
  }
}

export const useCreateNoRutine = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async (data: CreateNoRutineData) => {
          await axiosInstance.post('/hangar74/non-routine', data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
          toast.success("¡Creado!", {
              description: `La orden no rutinara ha sido creada correctamente.`
          })
        },
      onError: (error: AxiosError) => {
        console.log(error)
          toast.error('Oops!', {
            description: 'No se pudo registrar la orden no rutinaria...'})
        },
      }
  )
  return {
    createNoRutine: createMutation,
  }
}


export const useUpdateNoRoutineTask = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async (data: {
        id: string,
        inspector_responsable?: string,
        technician_responsable?: string,
        status?: string,
      }) => {
          await axiosInstance.put(`/hangar74/no-routine-task/${data.id}`, data)
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
    updateNoRoutineTask: updateMutation,
  }
}
