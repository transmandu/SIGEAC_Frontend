import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCredit = () => {

  const queryCredit = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
          await axiosInstance.post('/transmandu/credits', data)
        },
        onSuccess: () => {
          queryCredit.invalidateQueries({queryKey: ['credits']})
          toast("¡Creado!", {
              description: `¡El credito se ha creado correctamente!`
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
      createCredit: createMutation,
    }
}
