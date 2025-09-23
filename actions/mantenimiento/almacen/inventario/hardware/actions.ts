import axiosInstance from "@/lib/axios"
import { HardwareArticle } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateHardwareArticle = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: ["hardware-articles"],
    mutationFn: async ({data, company}: {company: string, data: HardwareArticle}) => {
      await axiosInstance.post(`/${company}/hardware-article`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['articles']})
      queryClient.invalidateQueries({queryKey: ['hardware-articles']})
      queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
      toast.success("¡Artículo de Ferretería Creado!", {
        description: `El artículo de ferretería ha sido registrado correctamente en el inventario.`
      })
    },
    onError: (error) => {
      toast.error('Error al crear artículo', {
        description: 'No se pudo registrar el artículo de ferretería. Verifique los datos e intente nuevamente.'
      })
      console.error("Error creating hardware article:", error)
    },
  })
  
  return {
    createHardwareArticle: createMutation,
  }
}

export const useUpdateHardwareArticle = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationKey: ["hardware-articles"],
    mutationFn: async ({data, company, id}: {company: string, data: Partial<HardwareArticle>, id: number}) => {
      await axiosInstance.put(`/${company}/hardware-article/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['articles']})
      queryClient.invalidateQueries({queryKey: ['hardware-articles']})
      queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
      toast.success("¡Artículo Actualizado!", {
        description: `El artículo de ferretería ha sido actualizado correctamente.`
      })
    },
    onError: (error) => {
      toast.error('Error al actualizar', {
        description: 'No se pudo actualizar el artículo de ferretería.'
      })
      console.error("Error updating hardware article:", error)
    },
  })
  
  return {
    updateHardwareArticle: updateMutation,
  }
}

export const useDeleteHardwareArticle = () => {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationKey: ["hardware-articles"],
    mutationFn: async ({company, id}: {company: string, id: number}) => {
      await axiosInstance.delete(`/${company}/hardware-article/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['articles']})
      queryClient.invalidateQueries({queryKey: ['hardware-articles']})
      queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
      toast.success("¡Artículo Eliminado!", {
        description: `El artículo de ferretería ha sido eliminado del inventario.`
      })
    },
    onError: (error) => {
      toast.error('Error al eliminar', {
        description: 'No se pudo eliminar el artículo de ferretería.'
      })
      console.error("Error deleting hardware article:", error)
    },
  })
  
  return {
    deleteHardwareArticle: deleteMutation,
  }
}
