import axios from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/api-error"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Vendor } from "@/types"

export interface CreateVendorSchema {
  name: string
  email: string
  phone: string
  address?: string
  type: "VENDOR" | "BENEFICIARY"
}

/** Actualización parcial: solo viajan los campos que cambiaron. */
export interface UpdateVendorSchema extends Partial<CreateVendorSchema> {
  id: number | string
}


export const useCreateVendor = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<Vendor, Error, CreateVendorSchema>({
    mutationFn: async (data) => {
      const { data: res } = await axios.post(`/${companySlug}/vendors`, data)
      return res.data as Vendor
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["vendors", companySlug] })
      toast.success("¡Creado!", {
        description: "El proveedor ha sido creado correctamente."
      })
    },
    onError: (error) => {
      toast.error("¡Error!", {
        description: getApiErrorMessage(error, "Hubo un error al crear el proveedor."),
      })
    },
  })
}


export const useUpdateVendor = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<Vendor, Error, UpdateVendorSchema>({
    mutationFn: async ({ id, ...data }) => {
      const { data: res } = await axios.put(`/${companySlug}/vendors/${id}`, data)
      return res.data as Vendor
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["vendors", companySlug] })
      toast.success("¡Actualizado!", {
        description: "El proveedor ha sido actualizado correctamente."
      })
    },
    onError: (error) => {
      toast.error("¡Error!", {
        description: getApiErrorMessage(error, "Hubo un error al actualizar el proveedor."),
      })
    },
  })
}


export const useDeleteVendor = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<number | string, Error, number | string>({
    mutationFn: async (id) => {
      await axios.delete(`/${companySlug}/vendors/${id}`)
      return id
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["vendors", companySlug] })
      toast.success("¡Eliminado!", {
        description: "El proveedor ha sido eliminado correctamente."
      })
    },
    onError: (error) => {
      toast.error("¡Error!", {
        description: getApiErrorMessage(error, "Hubo un error al eliminar el proveedor."),
      })
    },
  })
}
