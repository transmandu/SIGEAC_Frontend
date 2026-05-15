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
     * Mantiene datos "frescos" poco tiempo
     * para que React Query no se quede pegado demasiado
     */
    staleTime: 1000 * 10, // 10s

    /**
     * 🔥 CLAVE: polling ligero (fallback real-time sin WebSockets)
     * 15–20s es un estándar razonable
     */
    refetchInterval: 15000,

    /**
     * Refetch cuando el usuario vuelve a la pestaña
     */
    refetchOnWindowFocus: true,

    /**
     * Evita refetch agresivo en reconexiones si no quieres ruido
     */
    refetchOnReconnect: true,
  });

  const notifications = query.data ?? [];

  const unreadCount = notifications.reduce(
    (acc, n) => acc + (n.read_at ? 0 : 1),
    0
  );

  const latestNotification = notifications[0] ?? null;

  /**
   * 🔥 Acción manual optimizada (dropdown open, bell click, etc.)
   */
  const refetchOnOpen = useCallback(() => {
    if (!normalizedCompany) return;

    queryClient.invalidateQueries({
      queryKey: ['notifications', normalizedCompany],
    });
  }, [queryClient, normalizedCompany]);

  /**
   * 🔥 helper global (lo usarás desde mutations)
   * esto es lo que realmente soluciona tu problema de "no actualiza"
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