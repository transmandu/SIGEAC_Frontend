import axiosInstance from "@/lib/axios"
import { notifyError } from "@/lib/notify-error"
import { DepartmentType } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface DepartmentTypePayload {
  name: string
  connector?: string | null
  level?: number
  is_active?: boolean
}

const useTypeMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  messages: { success: string; action: string },
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-types"] })
      queryClient.invalidateQueries({ queryKey: ["departments"] })

      toast.success("¡Listo!", { description: messages.success })
    },

    onError: (error) => {
      notifyError(error, { action: messages.action })
    },
  })
}

export const useCreateDepartmentType = () => {
  const createMutation = useTypeMutation(
    async ({ company, ...data }: DepartmentTypePayload & { company: string }) =>
      await axiosInstance.post<DepartmentType>(`/${company}/department-types`, data),
    {
      success: "El tipo de departamento fue creado.",
      action: "crear el tipo de departamento",
    },
  )

  return { createDepartmentType: createMutation }
}

export const useUpdateDepartmentType = () => {
  const updateMutation = useTypeMutation(
    async ({
      company,
      id,
      ...data
    }: Partial<DepartmentTypePayload> & { company: string; id: number }) =>
      await axiosInstance.put<DepartmentType>(`/${company}/department-types/${id}`, data),
    {
      success: "El tipo de departamento fue actualizado.",
      action: "actualizar el tipo de departamento",
    },
  )

  return { updateDepartmentType: updateMutation }
}

export const useDeleteDepartmentType = () => {
  const deleteMutation = useTypeMutation(
    async ({ company, id }: { company: string; id: number }) =>
      await axiosInstance.delete(`/${company}/department-types/${id}`),
    {
      success: "El tipo de departamento fue eliminado.",
      action: "eliminar el tipo de departamento",
    },
  )

  return { deleteDepartmentType: deleteMutation }
}
