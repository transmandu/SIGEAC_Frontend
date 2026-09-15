import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface WorkshopSchema {
  name: string
  rif?: string
  address?: string
  phone?: string
  contact_name?: string
}

export const useCreateWorkshop = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ company, data }: {
      company: string | undefined, data: WorkshopSchema
    }) => {
      const response = await axiosInstance.post(`/${company}/workshops`, data)
      return response.data?.data ?? response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workshops", variables.company] })
      toast.success("¡Creado!", {
        description: "¡El taller se ha creado correctamente!",
      })
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description: error?.response?.data?.message || "No se pudo crear el taller...",
      })
    },
  })

  return {
    createWorkshop: createMutation,
  }
}
