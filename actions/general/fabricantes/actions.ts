import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ManufacturerSchema {
    name: string,
    description: string,
    type: "AIRCRAFT" | "PART",
}

export const useCreateManufacturer = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async ({company, data}: {
          company: string | undefined, data: ManufacturerSchema
        }) => {
            await axiosInstance.post(`/${company}/manufacturers`, data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['manufacturers']})
            toast("¡Creado!", {
                description: `¡El fabricante se ha creado correctamente!`
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
      createManufacturer: createMutation,
    }
}


export const useDeleteManufacturer = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/hangar74/manufacturers/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['manufacturers']})
          toast.success("¡Eliminado!", {
              description: `¡El fabricante ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar al fabricante!"
        })
        },
      }
  )

  return {
    deleteManufacturer: deleteMutation,
  }
}
