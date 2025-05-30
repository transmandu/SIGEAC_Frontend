import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
interface Tool {
  article_part_number: string;
  article_alt_part_number?: string;
  article_serial: string;
}

interface CreateServiceData {
  service: {
    name: string;
    description: string;
    manufacturer_id: string;
    type: "PART" | "AIRCRAFT";
    origin_manual?: string;
  };
  tasks: {
    description: string;
    tools: Tool[];
  }[];
}

export const useCreateMaintenanceService = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async (data: CreateServiceData) => {
          await axiosInstance.post('/hangar74/service-task', data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['maintenance-services']})
          toast.success("¡Creado!", {
              description: `El servicio ha sido registrado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo registrar el servicio...'
          })
          console.log(error)
        },
      }
  )
  return {
    createService: createMutation,
  }
}


export const useDeleteService = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id}: {id: string}) => {
          await axiosInstance.delete(`/hangar74/service-task/${id}`)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['maintenance-services']})
          toast.success("¡Eliminado!", {
              description: `¡El servicio ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el servicio!"
        })
        },
      }
  )

  return {
    deleteService: deleteMutation,
  }
}
