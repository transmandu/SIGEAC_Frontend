import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCreditSell = () => {

  const queryCreditSell = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
          await axiosInstance.post('/transmandu/credits-with-sells', data)
        },
        onSuccess: () => {
          queryCreditSell.invalidateQueries({queryKey: ['credit-sell']})
          toast("¡Creado!", {
              description: `¡El crédito se ha creado correctamente!`
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
      createCreditSell: createMutation,
    }
}