import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useMarkNotificationAsRead = (company: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(
        `/${company}/notifications/${id}/read`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', company],
      });
    },
  });
};