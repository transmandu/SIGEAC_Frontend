import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
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

  const query = useQuery({
    queryKey: ['notifications', normalizedCompany],
    queryFn: () =>
      fetchNotifications(normalizedCompany),
    enabled: !!normalizedCompany,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (!echo || !userId) return
    const echoInstance = echo
    const channel = echoInstance.private(
      `users.${userId}`
    )

    channel.listen(
      '.notification.created',
      () => {
        console.log(
          'Nueva notificación'
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

  return {
    ...query,
    notifications,
    unreadCount,
    latestNotification,
  }
}