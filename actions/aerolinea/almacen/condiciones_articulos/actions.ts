import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateConditionSchema {
    name: string,
    description: string,
    registered_by: string,
  }

export const useCreateCondition = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateConditionSchema) => {
            await axiosInstance.post('/hangar74/condition-article', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['conditions']})
            toast("¡Creado!", {
                description: `¡La condición se ha creado correctamente!`
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
      createCondition: createMutation,
    }
}

export const useDeleteCondition = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/condition-article/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['conditions']})
          toast.success("¡Eliminado!", {
              description: `¡La condicion ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la condicion!"
        })
        },
      }
  )

  return {
    deleteCondition: deleteMutation,
  }
}
