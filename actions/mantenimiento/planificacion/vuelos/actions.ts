import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface CreateFlightControlData {
  aircraft_id: string,
  flight_cycles: number,
  flight_hours: number,
  flight_number: string,
  origin: string,
  destination: string,
  aircraft_operator: string,
}

export const useCreateFlightControl = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreateFlightControlData, company: string}) => {
          await axiosInstance.post(`/${company}/flight-control`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['flight-control']})
          toast.success("¡Creado!", {
              description: `El vuelo ha sido registrado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo registrar el vuelo...'
          })
          console.log(error)
        },
      }
  )
  return {
    createFlightControl: createMutation,
  }
}

export const useUpdateFlightControl = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({id, data, company}: {id: string, data: Partial<CreateFlightControlData>, company: string}) => {
          await axiosInstance.put(`/${company}/flight-control/${id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['flight-control']})
          toast.success("¡Actualizado!", {
              description: `El vuelo ha sido actualizado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizar el vuelo...'
          })
          console.log(error)
        },
      }
  )
  return {
    updateFlightControl: updateMutation,
  }
}
