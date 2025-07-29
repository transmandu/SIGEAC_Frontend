import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCreditFlight = () => {

  const queryCreditFlight = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async ({data, company}: {data: any, company?: string}) => {
          await axiosInstance.post(`/${company}/credits-with-flights`, data)
        },
        onSuccess: () => {
          queryCreditFlight.invalidateQueries({queryKey: ['credit-flight']})
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
      createCreditFlight: createMutation,
    }
}
