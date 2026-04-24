import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Employee } from "@/types"

interface DeactivateParams {
  company: string
  id: number
}

export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ company, id }: DeactivateParams) => {
      const { data } = await axiosInstance.patch(
        `/${company}/employees/${id}/deactivate`
      )

      return data as { message: string; employee: Employee }
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company]
      })

      queryClient.invalidateQueries({
        queryKey: ["employees-inactive", variables.company]
      })

      toast.success(data?.message ?? "Empleado desactivado correctamente")
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Error al desactivar empleado")
    }
  })
}