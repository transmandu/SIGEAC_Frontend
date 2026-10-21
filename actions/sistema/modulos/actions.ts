import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { notifyError } from "@/lib/notify-error";

export const useCreateModule = () => {
    const queryClient = useQueryClient()
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post('/modules', data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['modules']})
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
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/modules/${id}`)
        },
      onSuccess: () => {

          queryClient.invalidateQueries({queryKey: ['modules']})
          toast.success("¡Eliminado!", {
              description: `¡El modulo ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          notifyError(e, { action: "eliminar el modulo" })
        },
      }
  )
  return {
    deleteModule: deleteMutation,
  }
}

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.put(`/modules/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast("¡Actualizado!", {
        description: "¡El modulo se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el módulo" });
    },
  });

  return {
    updateModule: updateMutation,
  };
};
