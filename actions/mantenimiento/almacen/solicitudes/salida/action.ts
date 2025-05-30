import axiosInstance from "@/lib/axios"
import { ComponentArticle, ConsumableArticle, DispatchRequest, Request } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface IDispatchRequestAction{
  justification: string,
  submission_date: string,
  created_by: string,
  requested_by: string,
  destination_place: string,
  category: string,
  articles: {
    article_id: number,
    quantity?: number,
    serial?: string | null,
  }[],
  user_id: number,
}

export const useCreateDispatchRequest = () => {

    const queryClient = useQueryClient()

    const router = useRouter();

    const createMutation = useMutation({
        mutationKey: ["dispatch-request"],
        mutationFn: async (data: IDispatchRequestAction) => {
            await axiosInstance.post('/hangar74/dispatch-order', data,
              {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            })
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['dispatch-request']})
            toast.success("¡Creado!", {
                description: `La solicitud ha sido creado correctamente.`
            }),
            router.refresh()
          },
        onError: (error) => {
            toast.error('Oops!', {
              description: 'No se pudo crear la solicitud...'
            })
            console.log(error)
          },
        }
    )
    return {
      createDispatchRequest: createMutation,
    }
}


export const useUpdateStatusDispatchRequest = () => {
  const queryClient = useQueryClient()
  const updateStatusMutation = useMutation({
      mutationKey: ["dispatch-request-approve"],
      mutationFn: async ({id, status, approved_by, delivered_by}: {
        id: string | number,
        status: string,
        approved_by: string,
        delivered_by: string,
      }) => {
          await axiosInstance.put(`/hangar74/update-status-dispatch/${id}`, {status: status, approved_by: approved_by, delivered_by: delivered_by})
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['dispatches-requests-in-process']}),
          queryClient.invalidateQueries({queryKey: ['dispatched-articles']}),
          toast.success('¡Actualizado!', {
            description: '¡La solicitud ha sido actualizada!'
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo crear la solicitud...'
          })
          console.log(error)
        },
      }
  )
  return {
    updateDispatchStatus: updateStatusMutation,
  }
}
