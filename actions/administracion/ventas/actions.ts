import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface SellData {
  client_id: string,
  articles_id: string[],
  date: Date,
  reference_pick: string,
  concept: string,
  total_price: string,
  payed_amount: string,
}

export const useCreateSell = () => {

  const queryRoute = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: SellData) => {
      await axiosInstance.post('/transmandu/sells', data)
    },
    onSuccess: () => {
      queryRoute.invalidateQueries({queryKey: ['sell']})
          toast("¡Creado!", {
            description: `¡La venta se ha creado correctamente!`
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
    createSell: createMutation,
  }
}

export const useDeleteSell = () => {

  const queryRoute = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/sells/${id}`)
        },
      onSuccess: () => {

          queryRoute.invalidateQueries({queryKey: ['sell']})
          toast.success("¡Eliminado!", {
              description: `¡La venta ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la venta!"
        })
        },
      }
  )

  return {
    deleteSell: deleteMutation,
  }
}

export const useUpdateSell = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await axiosInstance.put(`/transmandu/sells/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sell'] });
      toast("¡Actualizado!", {
        description: "¡La venta se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar la venta: ${error}`,
      });
    },
  });

  return {
    updateSell: updateMutation,
  };
};
