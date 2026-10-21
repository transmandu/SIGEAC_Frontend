import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { notifyError } from "@/lib/notify-error";

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
            const response = await axiosInstance.post('/register', data)
            return response.data
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']})
            toast.success("¡Creado!", {
                description: `¡El usuario ha sido creado correctamente!`
            })
          },
        onError: (e) => {
            notifyError(e, { action: "crear el usuario" })
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
          notifyError(e, { action: "eliminar el usuario" })
        },
      }
  )

  return {
    deleteUser: deleteMutation,
  }
}
