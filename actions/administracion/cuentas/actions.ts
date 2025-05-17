import axiosInstance from "@/lib/axios"
import { Accountant } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateAccount = () => {
    const queryAccount = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/transmandu/accountants', data)
          },
        onSuccess: () => {
            queryAccount.invalidateQueries({queryKey: ['account']})
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
      createAccount: createMutation,
    }
}

export const useDeleteAccount = () => {
  const queryAccount = useQueryClient()
  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/accountants/${id}`)
        },
      onSuccess: () => {

          queryAccount.invalidateQueries({queryKey: ['account']})
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
    deleteAccount: deleteMutation,
  }
}

export const useGetAccount = (id: string | null) => {
  const accountsQuery = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const {data} = await axiosInstance.get(`/transmandu/accountants/${id}`);
      return data as Accountant;
    },
    enabled: !!id
  });
  return {
    data: accountsQuery.data,
    loading: accountsQuery.isLoading,
    error: accountsQuery.isError 
  };
};

export const useUpdateAccount = () => {
  const queryAccount = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async (values: {
      id: string
      name: string,
      category?: string }) => {
      await axiosInstance.patch(`/transmandu/accountants/${values.id}`, {
        name: values.name,
        category: values.category ?? null,
      });
    },
    onSuccess: () => {
      queryAccount.invalidateQueries({ queryKey: ['account'] });
      toast.success("¡Actualizado!", {
        description: "¡La cuenta se ha actualizado correctamente!",
      });
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar la cuenta: ${error}`,
      });
    },
  });

  return {
    updateAccount: updateMutation,
  };
};