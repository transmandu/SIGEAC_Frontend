import axiosInstance from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ManufacturerSchema {
  name: string,
  description: string,
  type: "AIRCRAFT" | "ENGINE" | "APU" | "PROPELLER" | "GENERAL" | "PART" | "TOOL",
}

export const useCreateManufacturer = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ company, data }: {
      company: string | undefined, data: ManufacturerSchema
    }) => {
      const response = await axiosInstance.post(`/${company}/manufacturers`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      toast("¡Creado!", {
        description: `¡El fabricante se ha creado correctamente!`
      })
    },
    onError: (error) => {
      toast.error('Error', {
        description: getApiErrorMessage(error, "No se creó correctamente.")
      })
    },
  }
  )

  return {
    createManufacturer: createMutation,
  }
}


export const useUpdateManufacturer = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({ company, id, data }: {
      company: string | undefined, id: number | string, data: ManufacturerSchema
    }) => {
      const response = await axiosInstance.put(`/${company}/manufacturers/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      toast.success("¡Actualizado!", {
        description: `¡El fabricante se ha actualizado correctamente!`
      })
    },
    onError: (error) => {
      toast.error('Error', {
        description: getApiErrorMessage(error, "No se actualizó correctamente.")
      })
    },
  })

  return {
    updateManufacturer: updateMutation,
  }
}

export const useDeleteManufacturer = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string | undefined; id: number | string }) => {
      await axiosInstance.delete(`/${company}/manufacturers/${id}`)
    },
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
      toast.success("¡Eliminado!", {
        description: `¡El fabricante ha sido eliminado correctamente!`
      })
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "¡Hubo un error al eliminar al fabricante!")
      })
    },
  }
  )

  return {
    deleteManufacturer: deleteMutation,
  }
}
