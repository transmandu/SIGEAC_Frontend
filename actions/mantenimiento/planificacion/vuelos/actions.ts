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
      mutationFn: async (data: CreateFlightControlData) => {
          await axiosInstance.post('/hangar74/flights', data)
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
