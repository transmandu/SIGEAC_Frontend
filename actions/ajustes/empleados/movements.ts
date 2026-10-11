import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

export type DepartmentMovementAction =
  | "transfer"
  | "change_role"
  | "retire"
  | "rehire"

export interface DepartmentMovementPayload {
  company: string
  employeeId: number
  action: DepartmentMovementAction
  department_id?: number
  location_id?: number
  job_title_id?: number | null
  is_head?: boolean
  effective_at?: string
  reason?: string
}

export const useRegisterDepartmentMovement = () => {
  const queryClient = useQueryClient()

  const movementMutation = useMutation({
    mutationFn: async ({ company, employeeId, ...data }: DepartmentMovementPayload) =>
      await axiosInstance.post(`/${company}/employees/${employeeId}/department-movements`, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      queryClient.invalidateQueries({ queryKey: ["employees"] })

      toast.success("¡Registrado!", {
        description: "El movimiento del empleado quedó registrado.",
      })
    },

    onError: (error) => {
      const data = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>)
        ?.response?.data

      toast.error("Oops!", {
        description:
          (data?.errors ? Object.values(data.errors)[0]?.[0] : undefined) ??
          data?.message ??
          "No se pudo registrar el movimiento.",
      })
    },
  })

  return { registerMovement: movementMutation }
}
