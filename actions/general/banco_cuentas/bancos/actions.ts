import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateBankSchema {
    name: string,
    slug: string,
    type: string,
}

export const useCreateBank = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateBankSchema) => {
            await axiosInstance.post('/banks', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['banks']})
            toast("¡Creado!", {
                description: `¡El banco se ha creado correctamente!`
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
      createBank: createMutation,
    }
}

export const useDeleteBank = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/banks/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['banks']})
          toast.success("¡Eliminado!", {
              description: `¡El banco ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el banco!"
        })
        },
      }
  )

  return {
    deleteBank: deleteMutation,
  }
}
