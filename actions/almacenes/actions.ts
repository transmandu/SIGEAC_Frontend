import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface createWarehouseSchema {
    name: string,
    company_id: number,
    location_id: number,
}

export const useCreateWarehouse = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: createWarehouseSchema) => {
            await axiosInstance.post('/warehouses', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['warehouses']})
            toast("¡Creado!", {
                description: `¡El almacén se ha creado correctamente!`
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
      createWarehouse: createMutation,
    }
}
