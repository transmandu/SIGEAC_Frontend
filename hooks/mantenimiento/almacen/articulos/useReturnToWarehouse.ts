import axios from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const updateStatus = async (article_id: number) => {
  const {data} = await axios.put(`/hangar74/update-status-items/${article_id.toString()}`, );
  return data;
};

export const useReturnToWarehouse = () => {
  const queryClient = useQueryClient()
  return useMutation<Promise<any>, Error, number>({
    mutationKey: ["update-status"],
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["dispatched-articles"]})
      toast("¡Devuelto!", {
          description: `¡El articulo ha regresado correctamente!`
      })
    },
    onError: (error) => {
      toast('Hey', {
        description: `No se creo logró retornar el articulo: ${error}`
      })
    },
  });
};
