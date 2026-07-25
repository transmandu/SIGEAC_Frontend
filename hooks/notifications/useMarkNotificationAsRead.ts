import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Notification } from '@/types/notifications/types';

export const useMarkNotificationAsRead = (company: string) => {
  const queryClient = useQueryClient();

  const queryKey = ['notifications', company];

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(
        `/${company}/notifications/${id}/read`
      );
    },

    onMutate: async (id: string) => {
      // Cancelamos refetches en vuelo para que no pisen el update optimista.
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<Notification[]>(queryKey);

      const readAt = new Date().toISOString();

      queryClient.setQueryData<Notification[]>(
        queryKey,
        (old = []) =>
          old.map((notification) =>
            notification.id === id && !notification.read_at
              ? { ...notification, read_at: readAt }
              : notification
          )
      );

      return { previous };
    },

    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });
};
