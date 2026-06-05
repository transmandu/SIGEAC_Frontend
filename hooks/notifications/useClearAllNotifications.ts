import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

export const useClearAllNotifications = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(
        `/${company}/notifications/clear/all`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', company],
      });

      toast.success('Todas las notificaciones eliminadas');
    },

    onError: () => {
      toast.error('Error al eliminar las notificaciones');
    },
  });
};