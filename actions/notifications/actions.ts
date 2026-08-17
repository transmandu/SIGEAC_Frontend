import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { broadcastQueryInvalidation } from '@/lib/cross-tab-sync';
import { Notification } from '@/types/notifications/types';

// Marcar como leída se refleja al instante en la campana: se actualiza la caché
// antes de que responda el servidor y solo se revierte si falla.
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

    // El update optimista es local; las otras pestañas refetchean una vez que
    // el servidor confirmó el read_at.
    onSuccess: () => {
      broadcastQueryInvalidation(queryKey);
    },

    // Revertir entero descartaría lo leído en paralelo: solo se devuelve a no
    // leída la notificación que falló.
    onError: (_error, id, context) => {
      const previous = context?.previous?.find(
        (notification) => notification.id === id
      );

      queryClient.setQueryData<Notification[]>(queryKey, (old = []) =>
        old.map((notification) =>
          notification.id === id
            ? { ...notification, read_at: previous?.read_at }
            : notification
        )
      );
    },
  });
};

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

    onSuccess: () => {
      broadcastQueryInvalidation(queryKey);
    },

    // Aquí sí se revierte todo el listado: la operación era atómica.
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });
};

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
