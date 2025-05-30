import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type BatchType = {
  part_number?: string,
  description?: string,
  alternative_part_number?: string,
  ata_code?: string,
  brand?: string,
  is_hazarous?: boolean,
  medition_unit?: string,
  min_quantity?: number,
  zone?: string,
  warehouse_id?: number,
  category?: string,
}

export const useCreateBatch = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: BatchType) => {
            await axiosInstance.post('/hangar74/batches', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['batches']})
            toast.success("¡Creado!", {
                description: `El lote ha sido creado correctamente.`
            })
          },
        onError: (error) => {
            toast.error('Oops!', {
              description: 'No se pudo crear el lote...'
            })
            console.log(error)
          },
        }
    )

    return {
      createBatch: createMutation,
    }
}
