import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateModule = () => {
    const queryCategory = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/modules', data)
          },
        onSuccess: () => {
            queryCategory.invalidateQueries({queryKey: ['modules']})
            toast("¡Creado!", {
                description: `¡El modulo se ha creado correctamente!`
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
      createModule: createMutation,
    }
}

export const useDeleteModule = () => {
  const queryCategory = useQueryClient()
  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/modules/${id}`)
        },
      onSuccess: () => {

          queryCategory.invalidateQueries({queryKey: ['category']})
          toast.success("¡Eliminado!", {
              description: `¡El modulo ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el modulo!"
        })
        },
      }
  )
  return {
    deleteCategory: deleteMutation,
  }
}

export const useUpdateModule = () => {
  const queryCategory = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.put(`/modules/${id}`, data);
    },
    onSuccess: () => {
      queryCategory.invalidateQueries({ queryKey: ['category'] });
      toast("¡Actualizado!", {
        description: "¡El modulo se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar el modulo: ${error}`,
      });
    },
  });

  return {
    updateCategory: updateMutation,
  };
};