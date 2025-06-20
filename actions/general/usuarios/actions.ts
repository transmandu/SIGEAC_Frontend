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

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  const createMutation = useMutation({
      mutationFn: async (data: {
        username: string,
        email: string,
        password: string,
        id: string,
      }) => {
          await axiosInstance.put(`/user/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['users']})
          queryClient.invalidateQueries({queryKey: ['user']})
          toast.success("¡Actualizado!", {
              description: `¡El usuario ha sido actualizado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al actualizar el usuario!"
        })
        },
      }
  )

  return {
    updateUser: createMutation,
  }
}
