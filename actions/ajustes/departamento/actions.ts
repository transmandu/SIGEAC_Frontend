import axiosInstance from "@/lib/axios"
import { Department } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { notifyError } from "@/lib/notify-error"

export interface DepartmentLocationInput {
  location_id: number
  email?: string | null
  is_active?: boolean
}

export interface DepartmentPayload {
  name: string
  acronym: string
  description?: string | null
  department_type_id?: number | null
  department_parent_id?: number | null
  locations?: DepartmentLocationInput[]
}

const useDepartmentMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  messages: { success: string; action: string },
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      queryClient.invalidateQueries({ queryKey: ["department-types"] })

      toast.success("¡Listo!", { description: messages.success })
    },

    onError: (error) => {
      notifyError(error, { action: messages.action })
    },
  })
}

export const useCreateDepartment = () => {
  const createMutation = useDepartmentMutation(
    async ({ company, ...data }: DepartmentPayload & { company: string }) =>
      await axiosInstance.post<Department>(`/${company}/departments`, data),
    {
      success: "El departamento ha sido creado correctamente.",
      action: "crear el departamento",
    },
  )

  return { createDepartment: createMutation };
};

export const useUpdateDepartment = () => {
  const updateMutation = useDepartmentMutation(
    async ({
      company,
      id,
      ...data
    }: Partial<Pick<DepartmentPayload, "name" | "acronym" | "description" | "department_type_id">> & {
      company: string
      id: number
      reason?: string
    }) => await axiosInstance.put<Department>(`/${company}/departments/${id}`, data),
    {
      success: "El departamento ha sido actualizado correctamente.",
      action: "actualizar el departamento",
    },
  )

  return { updateDepartment: updateMutation };
};

export const useMoveDepartment = () => {
  const moveMutation = useDepartmentMutation(
    async ({
      company,
      id,
      ...data
    }: {
      company: string
      id: number
      department_parent_id: number | null
      position?: number
      reason?: string
    }) => await axiosInstance.patch<Department>(`/${company}/departments/${id}/move`, data),
    {
      success: "El organigrama fue actualizado.",
      action: "mover el departamento",
    },
  )

  return { moveDepartment: moveMutation }
}

export const useReorderDepartments = () => {
  const reorderMutation = useDepartmentMutation(
    async ({
      company,
      ...data
    }: {
      company: string
      parent_id: number | null
      ordered_ids: number[]
    }) => await axiosInstance.post(`/${company}/departments/reorder`, data),
    {
      success: "El orden fue actualizado.",
      action: "reordenar los departamentos",
    },
  )

  return { reorderDepartments: reorderMutation }
}

export const useSetDepartmentActive = () => {
  const activeMutation = useDepartmentMutation(
    async ({
      company,
      id,
      ...data
    }: {
      company: string
      id: number
      is_active: boolean
      reason?: string
    }) => await axiosInstance.patch<Department>(`/${company}/departments/${id}/active`, data),
    {
      success: "El estado del departamento fue actualizado.",
      action: "cambiar el estado del departamento",
    },
  )

  return { setDepartmentActive: activeMutation }
}

export const useSyncDepartmentLocations = () => {
  const syncMutation = useDepartmentMutation(
    async ({
      company,
      id,
      locations,
    }: {
      company: string
      id: number
      locations: DepartmentLocationInput[]
    }) => await axiosInstance.put<Department>(`/${company}/departments/${id}/locations`, { locations }),
    {
      success: "Las sedes del departamento fueron actualizadas.",
      action: "actualizar las sedes del departamento",
    },
  )

  return { syncDepartmentLocations: syncMutation }
}

export const useMergeDepartment = () => {
  const mergeMutation = useDepartmentMutation(
    async ({
      company,
      id,
      ...data
    }: {
      company: string
      id: number
      target_id: number
      reason?: string
    }) => await axiosInstance.post<Department>(`/${company}/departments/${id}/merge`, data),
    {
      success: "Los departamentos fueron fusionados.",
      action: "fusionar el departamento",
    },
  )

  return { mergeDepartment: mergeMutation }
}

export const useDeleteDepartment = () => {
  const deleteMutation = useDepartmentMutation(
    async ({ id, company }: { id: number; company: string }) =>
      await axiosInstance.delete(`/${company}/departments/${id}`),
    {
      success: "El departamento ha sido eliminado correctamente.",
      action: "eliminar el departamento",
    },
  )

  return { deleteDepartment: deleteMutation }
}
