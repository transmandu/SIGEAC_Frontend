import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateAdministrationArticle = () => {

    const queryAdministrationArticle = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/transmandu/articles', data)
          },
        onSuccess: () => {
            queryAdministrationArticle.invalidateQueries({queryKey: ['article']})
            toast("¡Creado!", {
                description: `¡El articulo se ha creado correctamente!`
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
      createAdministrationArticle: createMutation,
    }
}

export const useDeleteAdministrationArticle = () => {

  const queryAdministrationArticle = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/articles/${id}`)
        },
      onSuccess: () => {

          queryAdministrationArticle.invalidateQueries({queryKey: ['article']})
          toast.success("¡Eliminado!", {
              description: `¡El articulo ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el articulo!"
        })
        },
      }
  )

  return {
    deleteAdministrationArticle: deleteMutation,
  }
}