import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateRenting = () => {

  const queryRenting = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
          await axiosInstance.post('/transmandu/rentings', data)
        },
        onSuccess: () => {
          queryRenting.invalidateQueries({queryKey: ['renting']})
          toast("¡Creado!", {
              description: `¡El arrendamiento se ha creado correctamente!`
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
      createRenting: createMutation,
    }
}

export const useDeleteRenting = () => {

  const queryRenting = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/rentings/${id}`)
        },
      onSuccess: () => {

          queryRenting.invalidateQueries({queryKey: ['renting']})
          toast.success("¡Eliminado!", {
              description: `¡El arrendamiento se ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar el arrendamiento!"
        })
        },
      }
  )

  return {
    deleteRenting: deleteMutation,
  }
}

export const useDefineEndDateRenting = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.patch(`/transmandu/renting-define-end-date/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renting'], exact: false });
      toast("¡Definido!", {
        description: "¡La fecha final se ha definido correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al definir la fecha: ${error}`,
      });
    },
  });

  return {
    defineEndDateRenting: updateMutation,
  };
};