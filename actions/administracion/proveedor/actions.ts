import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateAdministartionVendor = () => {

  const queryAdministrationVendor = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
          await axiosInstance.post('/transmandu/administration-vendors', data)
        },
        onSuccess: () => {
          queryAdministrationVendor.invalidateQueries({queryKey: ['vendor']})
          toast("¡Creado!", {
              description: `¡El registro del proveedor se ha creado correctamente!`
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
      createAdministrationVendor: createMutation,
    }
}

export const useDeleteAdministrationVendor = () => {

  const queryAdministrationVendor = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/administration-vendors/${id}`)
        },
      onSuccess: () => {

          queryAdministrationVendor.invalidateQueries({queryKey: ['vendor']})
          toast.success("¡Eliminado!", {
              description: `¡El registro del proveedor ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el proveedor!"
        })
        },
      }
  )

  return {
    deleteAdministrationVendor: deleteMutation,
  }
}

export const useUpdateAdministrationVendor = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.put(`/transmandu/administration-vendors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast("¡Actualizado!", {
        description: "¡El proveedor se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar el proveedor: ${error}`,
      });
    },
  });

  return {
    updateAdministrationVendor: updateMutation,
  };
};