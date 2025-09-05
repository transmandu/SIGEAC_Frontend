import axiosInstance from "@/lib/axios"
import { Article, ConsumableArticle } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"


export const useCreateArticle = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async ({data, company}: {data: ConsumableArticle, company: string}) => {
            await axiosInstance.post(`/${company}/articles`, data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['articles']})
            queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
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
