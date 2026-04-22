import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useAddRoleToUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: number }) => {
      await axiosInstance.post(`/users/${userId}/roles`, { role_id: roleId })
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success("Rol asignado correctamente.")
    },
    onError: () => {
      toast.error("No se pudo asignar el rol.")
    },
  })

  return { addRole: mutation }
}

export const useRemoveRoleFromUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: number }) => {
      await axiosInstance.delete(`/users/${userId}/roles`, { data: { role_id: roleId } })
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success("Rol removido correctamente.")
    },
    onError: () => {
      toast.error("No se pudo remover el rol.")
    },
  })

  return { removeRole: mutation }
}

export const useAddCompanyToUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      userId,
      companyId,
      locationIds,
    }: {
      userId: string
      companyId: number
      locationIds: number[]
    }) => {
      await axiosInstance.post(`/users/${userId}/companies`, {
        company_id: companyId,
        location_ids: locationIds,
      })
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success("Empresa asignada correctamente.")
    },
    onError: () => {
      toast.error("No se pudo asignar la empresa.")
    },
  })

  return { addCompany: mutation }
}

export const useRemoveCompanyFromUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ userId, companyId }: { userId: string; companyId: number }) => {
      await axiosInstance.delete(`/users/${userId}/companies/${companyId}`)
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success("Empresa removida correctamente.")
    },
    onError: () => {
      toast.error("No se pudo remover la empresa.")
    },
  })

  return { removeCompany: mutation }
}
