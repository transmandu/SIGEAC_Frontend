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