import axios from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const updateStatus = async (article_id: number, company?: string) => {
  const { data } = await axios.put(`/${company}/update-status-items/${article_id}`);
  return data;
};

export const useReturnToWarehouse = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationKey: ["update-status", company],
    mutationFn: (article_id: number) => updateStatus(article_id, company!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dispatched-articles", company]
      });
      toast("¡Devuelto!", {
        description: `¡El artículo ha regresado correctamente!`
      });
    },
    onError: (error) => {
      toast('Hey', {
        description: `No se logró retornar el artículo: ${error}`
      });
    },
  });
};
