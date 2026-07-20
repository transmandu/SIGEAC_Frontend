import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateFormSchema {
    first_name: string,
    last_name: string,
    username: string;
    email: string;
    isActive: boolean;
  }

export const useCreateUser = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateFormSchema) => {
           const response = await axiosInstance.post('/register', data)
             return response.data
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']})
            toast.success("¡Creado!", {
                description: `¡El usuario ha sido creado correctamente!`
            })
          },
        onError: (e) => {
            toast.error("Oops!", {
              description: "¡Hubo un error al crear el usuario!"
          })
          },
        }
    )

    return {
      createUser: createMutation,
    }
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  const createMutation = useMutation({
      mutationFn: async (data: {
        username: string,
        email?: string,
        password?: string,
        id: string,
      }) => {
          const { id, ...rest } = data
          const payload: Record<string, string> = {}
          if (rest.email) payload.email = rest.email
          if (rest.password) payload.password = rest.password

          const res = await axiosInstance.put(`/user/${id}`, payload)
          return res.data
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['users']})
          queryClient.invalidateQueries({queryKey: ['user']})
          toast.success("¡Actualizado!", {
              description: `¡El usuario ha sido actualizado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al actualizar el usuario!"
        })
        },
      }
  )

  return {
    updateUser: createMutation,
  }
}

export const useAddRoleToUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      userId,
      roleId,
      companyId,
    }: {
      userId: string
      roleId: number
      companyId: number
    }) => {
      await axiosInstance.post(`/users/${userId}/roles`, {
        role_id: roleId,
        company_id: companyId,
      })
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
    mutationFn: async ({
      userId,
      roleId,
      companyId,
    }: {
      userId: string
      roleId: number
      companyId?: number | null
    }) => {
      await axiosInstance.delete(`/users/${userId}/roles`, {
        data: { role_id: roleId, company_id: companyId ?? null },
      })
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

export const useAddModulesToUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      userId,
      companyId,
      moduleIds,
    }: {
      userId: string
      companyId: number
      moduleIds: number[]
    }) => {
      await axiosInstance.post(`/users/${userId}/modules`, {
        company_id: companyId,
        module_ids: moduleIds,
      })
    },

    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success("Módulos asignados correctamente.")
    },

    onError: () => {
      toast.error("No se pudieron asignar los módulos.")
    },
  })

  return { addModules: mutation }
}

export const useRemoveModulesFromUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      userId,
      companyId,
      moduleIds,
    }: {
      userId: string
      companyId: number
      moduleIds: number[]
    }) => {
      await axiosInstance.delete(`/users/${userId}/modules`, {
        data: {
          company_id: companyId,
          module_ids: moduleIds,
        },
      })
    },

    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success("Módulos removidos correctamente.")
    },

    onError: () => {
      toast.error("No se pudieron remover los módulos.")
    },
  })

  return { removeModules: mutation }
}