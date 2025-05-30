import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateBankAccountSchema {
    name: string,
    slug: string,
    account_number: string,
    account_type: string,
    account_owner: string,
    bank_id: string,
    company_id: string,
}

export const useCreateBankAccount = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateBankAccountSchema) => {
            await axiosInstance.post('/bank-accounts', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bank-accounts']})
            toast("¡Creado!", {
                description: `¡La cuenta se ha creado correctamente!`
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
      createBankAccount: createMutation,
    }
}

export const useDeleteBank = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/bank-accounts/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['banks']})
          toast.success("¡Eliminado!", {
              description: `¡La cuenta ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la cuenta!"
        })
        },
      }
  )

  return {
    deleteBank: deleteMutation,
  }
}
