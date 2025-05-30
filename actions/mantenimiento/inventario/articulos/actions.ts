import axiosInstance from "@/lib/axios"
import { Article, ConsumableArticle } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"


export const useCreateArticle = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: ConsumableArticle) => {
            await axiosInstance.post('/hangar74/articles', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['articles']})
            toast.success("¡Creado!", {
                description: `El articulo ha sido creado correctamente.`
            })
          },
        onError: (error) => {
            toast.error('Oops!', {
              description: 'No se pudo crear el articulo...'
            })
            console.log(error)
          },
        }
    )
    return {
      createArticle: createMutation,
    }
}
