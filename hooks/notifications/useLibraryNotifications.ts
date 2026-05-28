'use client'

import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { getEcho } from '@/lib/echo'

export default function useLibraryNotifications(
  userId?: string | number,
  onNotification?: () => void
) {
  const normalizedUserId = useMemo(() => {
    if (typeof userId === 'string') {
      const parsed = Number(userId)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    return userId
  }, [userId])

  const isReady = !!normalizedUserId

  useEffect(() => {
    if (!isReady || !normalizedUserId) return

    const echoInstance = getEcho()

    if (!echoInstance) return

    const channelName = `library-notification.${normalizedUserId}`

    const channel = echoInstance.private(channelName)

    const handler = (event: any) => {
      const status =
        event.status === 'approved'
          ? 'aprobada'
          : 'rechazada'

      toast.success(
        `Notificación: ${
          event.message || `Solicitud ${status}`
        }`
      )

      onNotification?.()
    }

    channel.listen('.share-request.reviewed', handler)

    return () => {
      channel.stopListening('.share-request.reviewed')

      echoInstance.leave(channelName)
    }
  }, [isReady, normalizedUserId, onNotification])
}