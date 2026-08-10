import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCreditRent = () => {

  const queryCreditRent = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async ({data, company}: {data: any, company?: string}) => {
          // El endpoint es el de créditos con renta vinculada, no el genérico.
          await axiosInstance.post(`/${company}/credits-with-rents`, data)
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
