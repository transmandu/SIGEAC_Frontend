import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Employee } from "@/types"

interface ReactivateParams {
  company: string
  id: number
}

export const useReactivateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ company, id }: ReactivateParams) => {
      const { data } = await axiosInstance.patch(
        `/${company}/employees/${id}/reactivate`
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

      toast.success(data?.message ?? "Empleado reactivado correctamente")
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Error al reactivar empleado")
    }
  })
}