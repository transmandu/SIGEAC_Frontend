import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useMarkAllNotificationsAsRead = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(
        `/${company}/notifications/mark-all-read`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread-count', company],
      });
    },
  });
};