import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface CreateCertificateData {
  name: string,
}

export const useCreateCertificate = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company}: {data: CreateCertificateData, company: string}) => {
          await axiosInstance.post(`/${company}/certificate`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['certificates']})
          toast.success("¡Creado!", {
              description: `El certificado ha sido creado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo crear el certificado...'
          })
          console.log(error)
        },
      }
  )
  return {
    createCertificate: createMutation,
  }
}

export const useDeleteCertificate = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number | string, company: string}) => {
          await axiosInstance.delete(`/${company}/certificate/${id}`)
        },
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['certificates'], exact: false})
          toast.success("¡Eliminado!", {
              description: `¡El certificado ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el certificado!"
        })
        },
      }
  )

  return {
    deleteCertificate: deleteMutation,
  }
}
