import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCompany = () => {
    const queryCategory = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/company', data)
          },
        onSuccess: () => {
            queryCategory.invalidateQueries({queryKey: ['companies']})
            toast("¡Creado!", {
                description: `¡La empresa ha creada correctamente!`
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
      createCompany: createMutation,
    }
}
