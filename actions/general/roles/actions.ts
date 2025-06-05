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