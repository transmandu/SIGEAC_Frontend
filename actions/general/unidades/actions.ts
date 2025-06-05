import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface createUnitSchema {
    value: string,
    label: string,
}

interface createSecondaryUnitSchema {
  secondary_unit: string,
  convertion_rate: number,
  unit_id: number,
  quantity_unit: number,
}

export const useCreateUnit = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: createUnitSchema) => {
            await axiosInstance.post('/hangar74/unit', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['units']})
            toast("¡Creado!", {
                description: `¡La unidad se ha creado correctamente!`
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
      createUnit: createMutation,
    }
}


export const useCreateSecondaryUnit = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async (data: createSecondaryUnitSchema) => {
          await axiosInstance.post('/hangar74/convertion', data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['secondary-units']})
          toast("¡Creado!", {
              description: `¡La unidad secundaria se ha creado correctamente!`
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
    createSecondaryUnit: createMutation,
  }
}

export const useDeleteUnit = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/hangar74/unit/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['units']})
          toast.success("¡Eliminado!", {
              description: `¡La unidad ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la unidad!"
        })
        },
      }
  )

  return {
    deleteUnit: deleteMutation,
  }
}

export const useDeleteSecondaryUnit = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/hangar74/convertion/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['secondary-units']})
          toast.success("¡Eliminado!", {
              description: `¡La unidad secundaria ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la unidad secundaria!"
        })
        },
      }
  )

  return {
    deleteSecondaryUnit: deleteMutation,
  }
}
