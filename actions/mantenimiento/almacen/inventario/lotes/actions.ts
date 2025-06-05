import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type BatchType = {
  name: string,
  slug: string,
  description?: string,
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
                description: `El renglon ha sido creado correctamente.`
            })
          },
        onError: (error) => {
            toast.error('Oops!', {
              description: 'No se pudo crear el renglon...'
            })
            console.log(error)
          },
        }
    )

    return {
      createBatch: createMutation,
    }
}

export const useDeleteBatch = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/hangar74/batches/${id}`)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['batches']})
          toast.success("¡Eliminado!", {
              description: `¡El renglon ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el renglon!"
        })
        },
      }
  )

  return {
    deleteBatch: deleteMutation,
  }
}
