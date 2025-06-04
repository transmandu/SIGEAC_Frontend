import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface VendorSchema {
    name: string,
    email?: string,
    phone?: string,
    address?: string,
    company: string,
}

export const useCreateVendor = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: VendorSchema) => {
            await axiosInstance.post(`/${data.company}/vendors`, data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vendors']})
            toast("¡Creado!", {
                description: `¡El proveedor se ha creado correctamente!`
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
      createVendor: createMutation,
    }
}
