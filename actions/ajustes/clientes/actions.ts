import axiosInstance from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateClientSchema {
  name: string,
  phone?: string,
  email?: string,
  address?: string,
  dni: string,
  dni_type: string,
  authorizing: "PROPIETARIO" | "EXPLOTADOR",
  pay_credit_days?: string
}

export const useCreateClient = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({company, data}: {
        company: string | null, data: CreateClientSchema
      }) => {
          const response = await axiosInstance.post(`/${company}/clients`, data)
          return response.data
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['clients']})
          toast("¡Creado!", {
              description: `¡El cliente se ha creado correctamente!`
          })
        },
      onError: (error) => {
          toast.error('Error', {
            description: getApiErrorMessage(error, "No se creó correctamente.")
          })
        },
      }
  )

  return {
    createClient: createMutation,
  }
}


export const useDeleteClient = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({id, company}: {id: string, company: string}) => {
          await axiosInstance.delete(`/${company}/clients/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['clients']})
          toast.success("¡Eliminado!", {
              description: `¡El cliente ha sido eliminado correctamente!`
          })
        },
      onError: (error) => {
          toast.error("Oops!", {
            description: getApiErrorMessage(error, "¡Hubo un error al eliminar el cliente!")
        })
        },
      }
  )

  return {
    deleteClient: deleteMutation,
  }
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: string; data: any, company: string }) => {
      await axiosInstance.patch(`/${company}/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast("¡Actualizado!", {
        description: "¡El cliente se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "Hubo un error al actualizar el cliente."),
      });
    },
  });

  return {
    updateClient: updateMutation,
  };
};
