import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ToolBoxProps {
  id?: number,
  name: string,
  created_by: string,
  delivered_by: string,
  tool_id: string[],
}


export const useCreateToolBox = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationKey: ["tool-box"],
        mutationFn: async (data: ToolBoxProps) => {
            await axiosInstance.post('/hangar74/tool-box', data,
              {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            })
          },
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['tool-boxes']})
            toast.success("¡Creado!", {
                description: `La caja ha sido creada correctamente.`
            })
          },
        onError: (error) => {
            toast.error('Oops!', {
              description: 'No se pudo crear la caja...'
            })
            console.log(error)
          },
        }
    )
    return {
      createToolBox: createMutation,
    }
}

export const useUpdateToolBox = () => {

  const queryClient = useQueryClient()

  const updateToolBoxMutation = useMutation({
      mutationKey: ["update-tool-box"],
      mutationFn: async (data: ToolBoxProps) => {
          await axiosInstance.put(`/hangar74/tool-box/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['tool-boxes']})
          toast.success("¡Actualizado!", {
              description: `La caja ha sido actualizada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizar la caja...'
          })
          console.log(error)
        },
      }
  )
  return {
    updateToolBox: updateToolBoxMutation,
  }
}

export const useDeleteToolBox = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/hangar74/tool-box/${id}`)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['tool-boxes']})
          toast.success("¡Eliminado!", {
              description: `¡La caja ha sido eliminada correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la caja!"
        })
        },
      }
  )

  return {
    deleteToolBox: deleteMutation,
  }
}
