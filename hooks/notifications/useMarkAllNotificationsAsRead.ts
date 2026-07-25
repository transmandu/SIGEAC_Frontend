import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Notification } from '@/types/notifications/types';

export const useMarkAllNotificationsAsRead = (company: string) => {
  const queryClient = useQueryClient();

  const queryKey = ['notifications', company];

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(
        `/${company}/notifications/mark-all-read`
      );
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<Notification[]>(queryKey);

      const readAt = new Date().toISOString();

      queryClient.setQueryData<Notification[]>(
        queryKey,
        (old = []) =>
          old.map((notification) =>
            notification.read_at
              ? notification
              : { ...notification, read_at: readAt }
          )
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });
};
