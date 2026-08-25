import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export interface CreateMaintenanceComplianceData {
  maintenance_control_item_id: number,
  maintenance_provider_id: string,
  work_order_id: string,
  compliance_date: string,
  hours_reading: number,
  cycles_reading: number,
  notes?: string,
}

export const useCreateMaintenanceCompliance = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateMaintenanceComplianceData, company: string }) => {
      const { data: response } = await axiosInstance.post(`/${company}/maintenance-compliances`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-controls'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-compliances'] })
      toast.success("¡Registrado!", {
        description: `El cumplimiento ha sido registrado correctamente.`
      })
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: 'No se pudo registrar el cumplimiento...'
      })
      console.log(error)
    },
  })

  return {
    createMaintenanceCompliance: createMutation,
  }
}
