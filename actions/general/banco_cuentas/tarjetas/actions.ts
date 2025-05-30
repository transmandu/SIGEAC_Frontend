import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateCardSchema {
    name: string,
    slug: string,
    card_number: string,
    type: string,
    bank_account_id: string,
}

export const useCreateCard = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateCardSchema) => {
            await axiosInstance.post('/cards', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cards']})
            toast("¡Creado!", {
                description: `¡La tarjeta se ha creado correctamente!`
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
      createCard: createMutation,
    }
}

export const useDeleteBank = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/cards/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['banks']})
          toast.success("¡Eliminado!", {
              description: `¡La tarjeta ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la tarjeta!"
        })
        },
      }
  )

  return {
    deleteCard: deleteMutation,
  }
}
