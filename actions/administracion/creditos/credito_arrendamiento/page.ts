import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCreditRent = () => {

  const queryCreditRent = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
          await axiosInstance.post('/transmandu/credits-with-rents', data) //todos los creditos con un id de renta vinculado
        },
        onSuccess: () => {
          queryCreditRent.invalidateQueries({queryKey: ['credit-rent']})
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
      createCreditRent: createMutation,
    }
}