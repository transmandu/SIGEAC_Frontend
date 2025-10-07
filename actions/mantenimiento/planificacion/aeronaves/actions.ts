import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface CreateAircraftWithPartsData {
aircraft: {
  manufacturer_id: string,
    client_id: string,
    serial: string,
    model?: string,
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
  serial: string;
  brand: string;
  time_since_new: number;  // Time Since New
  time_since_overhaul: number;  // Time Since Overhaul
  cycles_since_new: number;  // Cycles Since New
  cycles_since_overhaul: number;  // Cycles Since Overhaul
  condition_type: "NEW" | "OVERHAULED";
  is_father: boolean;
  sub_parts?: {
    part_name: string;
    part_number: string;
    serial: string;
    brand: string;
    time_since_new?: number;
    time_since_overhaul?: number;
    cycles_since_new?: number;
    cycles_since_overhaul?: number;
    condition_type: "NEW" | "OVERHAULED";
    is_father: boolean;
  }[];
}[]
}

export const useCreateMaintenanceAircraft = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreateAircraftWithPartsData, company: string}) => {
          console.log("📡 Enviando al backend:", data);
          await axiosInstance.post(`/${company}/aircrafts`, data)
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
      mutationFn: async ({id, company}: {id: number | string, company: string}) => {
          await axiosInstance.delete(`/${company}/aircrafts/${id}`)
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
