import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Vendor } from "@/types"

export interface CreateVendorSchema {
  name: string
  email: string
  phone: string
  address: string
  type: "VENDOR" | "BENEFICIARY"
}

export interface UpdateVendorSchema extends CreateVendorSchema {
  id: number | string
}

// Crear proveedor/beneficiario

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
    onError: () => {
      toast.error("¡Error!", {
        description: "Hubo un error al crear el proveedor."
      })
    },
  })
}

// Actualizar proveedor/beneficiario

export const useUpdateVendor = (companySlug?: string) => {
  const queryClient = useQueryClient()

  return useMutation<Vendor, Error, UpdateVendorSchema>({
    mutationFn: async (data) => {
      const { data: res } = await axios.put(`/${companySlug}/vendors/${data.id}`, data)
      return res.data as Vendor
    },
    onSuccess: () => {
      if (!companySlug) return
      queryClient.invalidateQueries({ queryKey: ["vendors", companySlug] })
      toast.success("¡Actualizado!", {
        description: "El proveedor ha sido actualizado correctamente."
      })
    },
    onError: () => {
      toast.error("¡Error!", {
        description: "Hubo un error al actualizar el proveedor."
      })
    },
  })
}

// Eliminar proveedor/beneficiario

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
    onError: (error: any) => {
      toast.error("¡Error!", {
        description: error?.response?.data?.errors ?? "Hubo un error al eliminar el proveedor."
      })
    },
  })
}
