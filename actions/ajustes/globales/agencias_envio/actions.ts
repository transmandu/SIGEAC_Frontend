import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ShippingAgency } from "@/types"

export interface CreateShippingAgencySchema {
  name: string
  code: string
  description?: string
  type: "NATIONAL" | "INTERNATIONAL"
  phone?: string
  email?: string
}

export interface UpdateShippingAgencySchema extends CreateShippingAgencySchema {
  id: number
}

// Crear agencia de envío

export const useCreateShippingAgency = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<ShippingAgency, Error, CreateShippingAgencySchema>({
    mutationFn: async (data) => {
      const { data: res } = await axios.post(
        `/${companySlug}/shipping-agencies`,
        data
      )
      return res as ShippingAgency
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["shipping-agencies", companySlug] })
      toast.success("¡Creado!", {
        description: "La agencia de envío ha sido creada correctamente."
      })
    },
    onError: () => {
      toast.error("¡Error!", {
        description: "Hubo un error al crear la agencia de envío."
      })
    },
  })
}

// Actualizar agencia de envío

export const useUpdateShippingAgency = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<ShippingAgency, Error, UpdateShippingAgencySchema>({
    mutationFn: async (data) => {
      const { data: res } = await axios.put(
        `/${companySlug}/shipping-agencies/${data.id}`,
        data
      )
      return res as ShippingAgency
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["shipping-agencies", companySlug] })
      toast.success("¡Actualizado!", {
        description: "La agencia de envío ha sido actualizada correctamente."
      })
    },
    onError: () => {
      toast.error("¡Error!", {
        description: "Hubo un error al actualizar la agencia de envío."
      })
    },
  })
}

// Eliminar agencia de envío

export const useDeleteShippingAgency = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<number, Error, number>({
    mutationFn: async (id) => {
      await axios.delete(`/${companySlug}/shipping-agencies/${id}`)
      return id
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["shipping-agencies", companySlug] })
      toast.success("¡Eliminado!", {
        description: "La agencia de envío ha sido eliminada correctamente."
      })
    },
    onError: () => {
      toast.error("¡Error!", {
        description: "Hubo un error al eliminar la agencia de envío."
      })
    },
  })
}