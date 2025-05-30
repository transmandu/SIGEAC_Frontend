import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateFormSchema {
    first_name: string,
    last_name: string,
    username: string;
    email: string;
    isActive: boolean;
  }

export const useCreateUser = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateFormSchema) => {
            await axiosInstance.post('/register', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']})
            toast.success("¡Creado!", {
                description: `¡El usuario ha sido creado correctamente!`
            })
          },
        onError: (e) => {
            toast.error("Oops!", {
              description: "¡Hubo un error al crear el usuario!"
          })
          },
        }
    )

    return {
      createUser: createMutation,
    }
}

export const useDeleteUser = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, companies}: {id: number | string, companies: {id: number, name: string}[]}) => {
          await axiosInstance.post(`/delete-user/${id}`, {companies})
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['users']})
          toast.success("¡Eliminado!", {
              description: `¡El usuario ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el usuario!"
        })
        },
      }
  )

  return {
    deleteUser: deleteMutation,
  }
}
