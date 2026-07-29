import axiosInstance from "@/lib/axios"
import { Retailer } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RetailerSchema {
    name: string,
    address?: string,
    phone?: string,
    company: string,
}

export const useCreateRetailer = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: RetailerSchema): Promise<Retailer> => {
            const res = await axiosInstance.post(`/${data.company}/retailers`, data)
            return res.data?.data as Retailer
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['retailers']})
            toast("¡Creado!", {
                description: `¡El comercio se ha creado correctamente!`
            })
          },
        onError: (error) => {
            toast('Hey', {
              description: `No se creo correctamente: ${error}`
            })
          },
        }
    )

    return {
      createRetailer: createMutation,
    }
}

export const useUpdateRetailer = () => {

    const queryClient = useQueryClient()

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: RetailerSchema & { id: number | string }) => {
            await axiosInstance.put(`/${data.company}/retailers/${id}`, data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['retailers']})
            toast("¡Actualizado!", {
                description: `¡El comercio se ha actualizado correctamente!`
            })
          },
        onError: (error) => {
            toast('Hey', {
              description: `No se actualizó correctamente: ${error}`
            })
          },
        }
    )

    return {
      updateRetailer: updateMutation,
    }
}

export const useDeleteRetailer = () => {

    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: async ({ id, company }: { id: number | string, company: string }) => {
            await axiosInstance.delete(`/${company}/retailers/${id}`)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['retailers']})
            toast("¡Eliminado!", {
                description: `¡El comercio se ha eliminado correctamente!`
            })
          },
        onError: (error) => {
            toast('Hey', {
              description: `No se eliminó correctamente: ${error}`
            })
          },
        }
    )

    return {
      deleteRetailer: deleteMutation,
    }
}
