import axiosInstance from "@/lib/axios"
import { ComponentArticle, ConsumableArticle, ToolArticle } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"


export const useCreateArticle = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationKey: ["articles"],
        mutationFn: async ({data, company}: {company: string, data: ConsumableArticle | ComponentArticle | ToolArticle}) => {
            await axiosInstance.post(`/${company}/article`, data,
              {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            })
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['articles']})
            queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
            toast.success("¡Creado!", {
                description: `El articulo ha sido creado correctamente.`
            })
          },
        onError: (error) => {
            toast.error('Oops!', {
              description: 'No se pudo crear el articulo...'
            })
            console.log(error)
          },
        }
    )
    return {
      createArticle: createMutation,
    }
}

export const useCreateDirectArticle = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationKey: ["articles"],
      mutationFn: async ({data, company}: {company: string, data: ConsumableArticle | ComponentArticle | ToolArticle}) => {
          await axiosInstance.post(`/${company}/article`, data,
            {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['articles']})
          queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
          toast.success("¡Creado!", {
              description: `El articulo ha sido creado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo crear el articulo...'
          })
          console.log(error)
        },
      }
  )
  return {
    createArticle: createMutation,
  }
}

export const useDeleteArticle = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: number | string, company: string}) => {
          await axiosInstance.delete(`/${company}/article/${id}`)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['articles']})
          // queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
          toast.success("¡Eliminado!", {
              description: `¡El articulo ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el articulo!"
        })
        },
      }
  )

  return {
    deleteArticle: deleteMutation,
  }
}

export const useUpdateArticleStatus = () => {

  const queryClient = useQueryClient()

  const updateArticleStatusMutation = useMutation({
      mutationKey: ["articles"],
      mutationFn: async ({id, status, company}: {
        id: number, status: string, company: string
      }) => {
          await axiosInstance.put(`/${company}/update-article-status/${id}`, {
            status: status
          })
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['in-transit-articles']})
          queryClient.invalidateQueries({queryKey: ['in-reception-articles']})
          queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
          toast.success("¡Actualizado!", {
              description: `El articulo ha sido actualizado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizar el articulo...'
          })
          console.log(error)
        },
      }
  )
  return {
    updateArticleStatus: updateArticleStatusMutation,
  }
}

export const useConfirmIncomingArticle = () => {

  const queryClient = useQueryClient()

  const confirmIncomingArticleMutation = useMutation({
      mutationKey: ["articles"],
      mutationFn: async ({values, company}: {
        values: {
          id?: number
          serial?: string,
          part_number: string,
          alternative_part_number?: string[],
          description: string,
          zone: string,
          manufacturer_id?: number | string,
          condition_id?: number | string,
          batches_id: string,
          is_special?: boolean,
          status: string,
          caducate_date?: string,
          quantity?: string | number,
          fabrication_date?:string,
          calendar_date?: string,
          certificate_8130?: File | string,
          certificate_fabricant?: File | string,
          certificate_vendor?: File | string,
          image?: File | string,
        },
        company: string
      }) => {
          await axiosInstance.post(`/${company}/update-article-warehouse/${values.id}`, {
            ...values
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['article']})
          queryClient.invalidateQueries({queryKey: ['in-transit-articles']})
          queryClient.invalidateQueries({queryKey: ['in-reception-articles']})
          queryClient.invalidateQueries({queryKey: ['articles']})
          queryClient.invalidateQueries({queryKey: ['batches']})
          queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
          toast.success("¡Actualizado!", {
              description: `El articulo ha sido actualizado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizar el articulo...'
          })
          console.log(error)
        },
      }
  )
  return {
  confirmIncoming: confirmIncomingArticleMutation,
  }
}

export const useEditArticle = () => {

  const queryClient = useQueryClient()

  const editArticleMutation = useMutation({
      mutationKey: ["articles"],
      mutationFn: async ({data, company}: {
        company: string, 
        data: {
          id: number
          part_number: string
          alternative_part_number?: string[]
          description: string
          zone: string
          manufacturer_id?: number | string
          condition_id?: number | string
          batches_id: string | number
          is_special?: boolean
          is_managed?: boolean
          caducate_date?: string
          fabrication_date?: string
          quantity?: number
          calendar_date?: string
          certificate_8130?: File | string
          certificate_fabricant?: File | string
          certificate_vendor?: File | string
          image?: File | string
          serial?: string
          hour_date?: string
          cycle_date?: string
          convertion_id?: number
        }
      }) => {
          await axiosInstance.post(`/${company}/update-article-warehouse/${data.id}`, data,
            {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['article']})
          queryClient.invalidateQueries({queryKey: ['articles']})
          queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
          queryClient.invalidateQueries({queryKey: ['batches']})
          queryClient.invalidateQueries({queryKey: ['in-transit-articles']})
          queryClient.invalidateQueries({queryKey: ['in-reception-articles']})
          toast.success("¡Actualizado!", {
              description: `El articulo ha sido actualizado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizar el articulo...'
          })
          // console.log(error)
        },
      }
  )
  return {
    editArticle: editArticleMutation,
  }
}