import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateFlight = () => {

    const queryFlight = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/transmandu/flights', data)
          },
        onSuccess: () => {
            queryFlight.invalidateQueries({queryKey: ['credit-flight-payment']})
            toast("¡Creado!", {
                description: `¡El vuelo se ha creado correctamente!`
            })
          },
        onError: (error) => {
            toast('Hey', {
              description: `No se creo correctamente: ${error}`
            })
          },
        }
    )

    return {
      createFlight: createMutation,
    }
}

export const useDeleteFlight = () => {

  const queryFlight = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/flights/${id}`)
        },
      onSuccess: () => {

          queryFlight.invalidateQueries({queryKey: ['credit-flight-payment']})
          toast.success("¡Eliminado!", {
              description: `¡El registro del vuelo ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el avión!"
        })
        },
      }
  )

  return {
    deleteFlight: deleteMutation,
  }
}