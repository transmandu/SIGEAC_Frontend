import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface CreateAircraftWithPartsData {
aircraft: {
  manufacturer_id: string,
    client_id: string,
    serial: string,
    acronym: string,
    flight_hours: number,
    flight_cycles: number,
    fabricant_date: Date,
    comments?: string,
    location_id: string,
},
parts: {
  part_name: string;
  part_number: string;
  part_hours: number;
  part_cycles: number;
}[]
}

export const useCreateMaintenanceAircraft = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async (data: CreateAircraftWithPartsData) => {
          await axiosInstance.post('/hangar74/aircrafts', data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['aircrafts']})
          toast.success("¡Creado!", {
              description: `La aeronave ha sido creada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo crear la aeronave...'
          })
          console.log(error)
        },
      }
  )
  return {
    createMaintenanceAircraft: createMutation,
  }
}

export const useDeleteMaintenanceAircraft = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/hangar74/aircrafts/${id}`)
        },
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['aircrafts'], exact: false})
        queryClient.invalidateQueries({queryKey: ['aircraft'], exact: false})
          toast.success("¡Eliminado!", {
              description: `¡La aeronave ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la aeronave!"
        })
        },
      }
  )

  return {
    deleteAircraft: deleteMutation,
  }
}
