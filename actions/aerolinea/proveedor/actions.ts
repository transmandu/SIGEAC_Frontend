import axiosInstance from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateAdministartionVendor = () => {

  const { selectedCompany } = useCompanyStore()
  const queryAdministrationVendor = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
          await axiosInstance.post(`/${selectedCompany?.slug}/vendors`, data)
        },
        onSuccess: () => {
          queryAdministrationVendor.invalidateQueries({queryKey: ['vendors']})
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

  const { selectedCompany } = useCompanyStore()
  const queryAdministrationVendor = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/${selectedCompany?.slug}/vendors/${id}`)
        },
      onSuccess: () => {

          queryAdministrationVendor.invalidateQueries({queryKey: ['vendors']})
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
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.put(`/${selectedCompany?.slug}/vendors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
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
