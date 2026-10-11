import axiosInstance from "@/lib/axios"
import { DepartmentType } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

export interface DepartmentTypePayload {
  name: string
  connector?: string | null
  level?: number
  is_active?: boolean
}

const serverMessage = (error: unknown, fallback: string): string => {
  const data = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>)
    ?.response?.data

  return (data?.errors ? Object.values(data.errors)[0]?.[0] : undefined) ?? data?.message ?? fallback
}

const useTypeMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  messages: { success: string; error: string },
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
      toast.error("Oops!", { description: serverMessage(error, messages.error) })
    },
  })
}

export const useCreateDepartmentType = () => {
  const createMutation = useTypeMutation(
    async ({ company, ...data }: DepartmentTypePayload & { company: string }) =>
      await axiosInstance.post<DepartmentType>(`/${company}/department-types`, data),
    {
      success: "El tipo de departamento fue creado.",
      error: "No se pudo crear el tipo de departamento.",
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
      error: "No se pudo actualizar el tipo de departamento.",
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
      error: "No se pudo eliminar el tipo de departamento.",
    },
  )

  return { deleteDepartmentType: deleteMutation }
}
