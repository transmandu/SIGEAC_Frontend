import axios from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/api-error"
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

/** Actualización parcial: solo viajan los campos que cambiaron. */
export interface UpdateShippingAgencySchema
  extends Partial<CreateShippingAgencySchema> {
  id: number
}


export const useCreateShippingAgency = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<ShippingAgency, Error, CreateShippingAgencySchema>({
    mutationFn: async (data) => {
      const { data: res } = await axios.post(
        `/${companySlug}/shipping-agencies`,
        data
      )
      return res.data as ShippingAgency
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["shipping-agencies", companySlug] })
      toast.success("¡Creado!", {
        description: "La agencia de envío ha sido creada correctamente."
      })
    },
    onError: (error) => {
      toast.error("¡Error!", {
        description: getApiErrorMessage(error, "Hubo un error al crear la agencia de envío."),
      })
    },
  })
}


export const useUpdateShippingAgency = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<ShippingAgency, Error, UpdateShippingAgencySchema>({
    mutationFn: async ({ id, ...data }) => {
      const { data: res } = await axios.put(
        `/${companySlug}/shipping-agencies/${id}`,
        data
      )
      return res.data as ShippingAgency
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["shipping-agencies", companySlug] })
      toast.success("¡Actualizado!", {
        description: "La agencia de envío ha sido actualizada correctamente."
      })
    },
    onError: (error) => {
      toast.error("¡Error!", {
        description: getApiErrorMessage(error, "Hubo un error al actualizar la agencia de envío."),
      })
    },
  })
}


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
    onError: (error) => {
      toast.error("¡Error!", {
        description: getApiErrorMessage(error, "Hubo un error al eliminar la agencia de envío."),
      })
    },
  })
}
