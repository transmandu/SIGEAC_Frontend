import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCash = () => {

  const queryCash = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async ({data, company}: {data: any, company: string}) => {
      await axiosInstance.post(`/${company}/cash`, data)
    },
    onSuccess: () => {
      queryCash.invalidateQueries({queryKey: ['cashes']})
          toast("¡Creado!", {
            description: `¡La caja se ha creado correctamente!`
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
    createCash: createMutation,
  }
}
export const useDeleteCash = () => {

  const queryCash = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number | string, company: string}) => {
          await axiosInstance.delete(`/${company}/cash/${id}`)
        },
      onSuccess: () => {

          queryCash.invalidateQueries({queryKey: ['cashes']})
          toast.success("¡Eliminado!", {
              description: `¡La caja ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la caja!"
        })
        },
      }
  )

  return {
    deleteCash: deleteMutation,
  }
}
