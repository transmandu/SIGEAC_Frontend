import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCategory = () => {
    const queryCategory = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/transmandu/accountants-categories', data)
          },
        onSuccess: () => {
            queryCategory.invalidateQueries({queryKey: ['category']})
            toast("¡Creado!", {
                description: `¡La categoría se ha creado correctamente!`
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
      createCategory: createMutation,
    }
}

export const useDeleteCategory = () => {
  const queryCategory = useQueryClient()
  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/accountants-categories/${id}`)
        },
      onSuccess: () => {

          queryCategory.invalidateQueries({queryKey: ['category']})
          toast.success("¡Eliminado!", {
              description: `¡La categoría ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la categoría!"
        })
        },
      }
  )
  return {
    deleteCategory: deleteMutation,
  }
}

export const useUpdateCategory = () => {
  const queryCategory = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.put(`/transmandu/accountants-categories/${id}`, data);
    },
    onSuccess: () => {
      queryCategory.invalidateQueries({ queryKey: ['category'] });
      toast("¡Actualizado!", {
        description: "¡La categoría se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar la categoría: ${error}`,
      });
    },
  });

  return {
    updateCategory: updateMutation,
  };
};