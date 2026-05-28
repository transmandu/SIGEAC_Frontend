import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { fetchNotifications } from './fetchNotifications'
import { getEcho } from '@/lib/echo'
import { Notification } from '@/types/notifications/types'

export const useNotifications = (
  company?: string,
  userId?: string | number
) => {
  const queryClient = useQueryClient()

  const normalizedCompany = company?.trim() ?? ''

  const normalizedUserId = useMemo(() => {
    if (typeof userId === 'string') {
      const parsed = Number(userId)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    return userId
  }, [userId])

  const isReady = !!normalizedCompany && !!normalizedUserId

  const query = useQuery({
    queryKey: ['notifications', normalizedCompany],
    queryFn: () => fetchNotifications(normalizedCompany),
    enabled: !!normalizedCompany,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (!isReady || !normalizedUserId) return

    const echoInstance = getEcho()

    if (!echoInstance) return

    const channelName = `notifications.${normalizedUserId}`
    const channel = echoInstance.private(channelName)

    const handler = (event: Notification) => {
      queryClient.setQueryData(
        ['notifications', normalizedCompany],
        (old: Notification[] = []) => [event, ...old]
      )
    }

    channel.listen('.new-notification', handler)

    return () => {
      channel.stopListening('.new-notification')
      echoInstance.leave(channelName)
    }
  }, [isReady, normalizedUserId, normalizedCompany, queryClient])

  const notifications = query.data ?? []

  const unreadCount = notifications.reduce(
    (acc, n) => acc + (n.read_at ? 0 : 1),
    0
  )

  const latestNotification = notifications[0] ?? null

  return {
    ...query,
    notifications,
    unreadCount,
    latestNotification,
  }
}