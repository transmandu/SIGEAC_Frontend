import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

interface CreatePrelimInspection {
  work_order_id: string,
}

export const useCreateReportPage = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreatePrelimInspection, company: string}) => {
          await axiosInstance.post(`/${company}/work-order-report-page`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-order-report-page'], exact: false})
          queryClient.invalidateQueries({queryKey: ['work-order-report-page'], exact: false})
          toast.success("¡Creado!", {
              description: `La hoja de reporte ha sido creada correctamente.`
          })
        },
      onError: (error: AxiosError) => {
        console.log(error)
          toast.error('Oops!', {
            description: 'No se pudo crear la hoja de reporte...'})
        },
      }
  )
  return {
    createPrelimInspection: createMutation,
  }
}


export const useAddReport = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({data, company}: {data: {
        id: string,
        ata_code: string,
        report: string,
        action_taken: string,
      }, company: string}) => {
          await axiosInstance.post(`/${company}/work-order-report-page-items/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-order-report-page'], exact: false})
          queryClient.invalidateQueries({queryKey: ['work-order-report-page-items'], exact: false})
          toast.success("¡Creado!", {
              description: `La hoja de reporte ha sido actualizada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizada la hoja de reporte...'
          })
        },
      }
  )
  return {
    updateAddReportItem: updateMutation,
  }
}

export const useUpdatePrelimInspection = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
      mutationFn: async ({data, company}: {data: {
        id: string,
        status: string,
      }, company: string}) => {
          await axiosInstance.patch(`/${company}/preliminary-inspection/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['work-orders'], exact: false})
          queryClient.invalidateQueries({queryKey: ['work-order'], exact: false})
          toast.success("¡Creado!", {
              description: `La inspección ha sido actualizada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizada la inspección...'
          })
        },
      }
  )
  return {
    updatePrelimInspection: updateMutation,
  }
}
