import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface createPermissionSchema {
    name: string,
    module: number,
    company: number,
  }

export const useCreatePermission = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: createPermissionSchema) => {
            await axiosInstance.post('/permission', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['permissions']})
            toast("¡Creado!", {
                description: `¡El permiso se ha creado correctamente!`
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
      createPermission: createMutation,
    }
}

export const useDeletePermission = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/permission/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['permissions']})
          toast.success("¡Eliminado!", {
              description: `¡El permiso ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el permiso!"
        })
        },
      }
  )

  return {
    deletePermission: deleteMutation,
  }
}
