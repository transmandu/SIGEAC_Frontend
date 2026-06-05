import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

export const useClearReadNotifications = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(
        `/${company}/notifications/clear/read`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', company],
      });

      toast.success('Notificaciones leídas eliminadas');
    },

    onError: () => {
      toast.error('Error al eliminar notificaciones leídas');
    },
  });
};