import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateRoleSchema {
    name: string
  }

export const useCreateRole = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateRoleSchema) => {
            await axiosInstance.post('/role', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['roles']})
            toast("¡Creado!", {
                description: `¡El rol se ha creado correctamente!`
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
      createRole: createMutation,
    }
}

export const useDeleteRole = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/role/${id}`)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['roles']})
          toast.success("¡Eliminado!", {
              description: `¡El rol ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el rol!"
        })
        },
      }
  )

  return {
    deleteRole: deleteMutation,
  }
}
