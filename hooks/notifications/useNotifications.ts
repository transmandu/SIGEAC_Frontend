import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  useCallback,
  useEffect,
} from 'react'

import { fetchNotifications } from './fetchNotifications'

import echo from '@/lib/echo'

export const useNotifications = (
  company?: string,
  userId?: number
) => {
  const queryClient = useQueryClient()

  const normalizedCompany = company ?? ''

  /**
   * React Query
   */
  const query = useQuery({
    queryKey: ['notifications', normalizedCompany],

    queryFn: () =>
      fetchNotifications(normalizedCompany),

    enabled: !!normalizedCompany,

    /**
     * Cache fresca
     */
    staleTime: 1000 * 60 * 5,

    /**
     * Tiempo en memoria
     */
    gcTime: 1000 * 60 * 30,

    /**
     * ❌ Ya NO usamos polling
     */
    refetchInterval: false,

    /**
     * Refetch al volver a pestaña
     */
    refetchOnWindowFocus: true,

    /**
     * Refetch si vuelve internet
     */
    refetchOnReconnect: true,

    /**
     * Evita fetch agresivo al montar
     */
    refetchOnMount: false,
  })

  /**
   * Reverb realtime
   */
  useEffect(() => {
    if (!echo || !userId) return

    const echoInstance = echo

    const channel = echoInstance.private(
      `users.${userId}`
    )

    channel.listen(
      '.notification.created',
      (event: any) => {
        console.log(
          'Nueva notificación:',
          event
        )

        queryClient.invalidateQueries({
          queryKey: [
            'notifications',
            normalizedCompany,
          ],
        })
      }
    )

    return () => {
      echoInstance.leave(
        `private-users.${userId}`
      )
    }
  }, [
    userId,
    normalizedCompany,
    queryClient,
  ])

  const notifications = query.data ?? []

  const unreadCount = notifications.reduce(
    (acc, n) => acc + (n.read_at ? 0 : 1),
    0
  )

  const latestNotification =
    notifications[0] ?? null

  /**
   * Refetch manual
   */
  const refetchOnOpen = useCallback(() => {
    if (!normalizedCompany) return

    queryClient.invalidateQueries({
      queryKey: [
        'notifications',
        normalizedCompany,
      ],
    })
  }, [queryClient, normalizedCompany])

  /**
   * Invalidate global
   */
  const invalidateNotifications =
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    }, [queryClient])

  return {
    ...query,
    notifications,
    unreadCount,
    latestNotification,
    refetchOnOpen,
    invalidateNotifications,
  }
}