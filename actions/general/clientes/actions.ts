import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateClientSchema {
  name: string,
  phone?: string,
  email?: string,
  address?: string,
  dni: string,
  dni_type: string,
}

export const useCreateClient = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({company, data}: {
        company: string | null, data: CreateClientSchema
      }) => {
          await axiosInstance.post(`/${company}/clients`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['clients']})
          toast("¡Creado!", {
              description: `¡El cliente se ha creado correctamente!`
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
    createClient: createMutation,
  }
}


export const useDeleteClient = () => {

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async ({dni, company}: {dni: string, company: string}) => {
          await axiosInstance.delete(`/${company}/clients/${dni}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['clients']})
          toast.success("¡Eliminado!", {
              description: `¡El cliente ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el cliente!"
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
    mutationFn: async ({ dni, data, company }: { dni: string; data: any, company: string }) => {
      await axiosInstance.put(`/${company}/clients/${dni}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast("¡Actualizado!", {
        description: "¡El cliente se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar el cliente: ${error}`,
      });
    },
  });

  return {
    updateClient: updateMutation,
  };
};
