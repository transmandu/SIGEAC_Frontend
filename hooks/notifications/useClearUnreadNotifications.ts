import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useClearUnreadNotifications = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(
        `/${company}/notifications/clear/unread`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', company],
      });
    },
  });
};