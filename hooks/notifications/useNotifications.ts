import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchNotifications } from './fetchNotifications';

export const useNotifications = (company?: string) => {
  const queryClient = useQueryClient();

  const normalizedCompany = company ?? '';

  const query = useQuery({
    queryKey: ['notifications', normalizedCompany],

    queryFn: () => fetchNotifications(normalizedCompany),

    enabled: !!normalizedCompany,

    /**
     * Mantener cache viva bastante tiempo
     */
    staleTime: 1000 * 60 * 5, // 5 min

    /**
     * Mantener en memoria
     */
    gcTime: 1000 * 60 * 30, // 30 min

    /**
     * ❌ NO polling constante
     */
    refetchInterval: false,

    /**
     * Solo refresca cuando vuelves a la pestaña
     */
    refetchOnWindowFocus: true,

    /**
     * Refetch al reconectarse internet
     */
    refetchOnReconnect: true,

    /**
     * Evita refetch innecesario al montar
     */
    refetchOnMount: false,
  });

  const notifications = query.data ?? [];

  const unreadCount = notifications.reduce(
    (acc, n) => acc + (n.read_at ? 0 : 1),
    0
  );

  const latestNotification = notifications[0] ?? null;

  /**
   * Manual refresh
   */
  const refetchOnOpen = useCallback(() => {
    if (!normalizedCompany) return;

    queryClient.invalidateQueries({
      queryKey: ['notifications', normalizedCompany],
    });
  }, [queryClient, normalizedCompany]);

  /**
   * Global invalidation
   */
  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['notifications'],
    });
  }, [queryClient]);

  return {
    ...query,
    notifications,
    unreadCount,
    latestNotification,
    refetchOnOpen,
    invalidateNotifications,
  };
};