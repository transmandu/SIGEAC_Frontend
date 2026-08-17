import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { fetchNotifications } from './fetchNotifications'
import { getSocketId, retainPrivateChannel } from '@/lib/echo'
import { Notification } from '@/types/notifications/types'

const EMPTY_NOTIFICATIONS: Notification[] = []

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
    // La lista se mantiene al día por websocket y por los updates optimistas de
    // marcar/limpiar. Un refetch al montar (el panel monta otra instancia de
    // este hook sobre la misma key) llegaba con el read_at todavía sin commitear
    // y revertía visualmente la notificación recién leída.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (!isReady || !normalizedUserId) return

    const channelName = `notifications.${normalizedUserId}`
    const { channel, release } = retainPrivateChannel(channelName)

    if (!channel) return

    const handler = (event: Notification) => {
      // Solo la compañía activa: el canal es por usuario, así que también trae
      // las notificaciones de las demás empresas a las que pertenece.
      if (event.data?.company && event.data.company !== normalizedCompany) {
        return
      }

      queryClient.setQueryData(
        ['notifications', normalizedCompany],
        (old: Notification[] = []) =>
          // El evento puede llegar dos veces (reconexión, o esta misma pestaña
          // con el hook montado en varios componentes); duplicar la fila
          // inflaría el contador de no leídas.
          old.some(n => n.id === event.id) ? old : [event, ...old]
      )
    }

    // Leer/limpiar en otra sesión (otro navegador o dispositivo): el servidor ya
    // aplicó el cambio, así que basta con refetchear. Entre pestañas del mismo
    // navegador esto llega antes por BroadcastChannel; el refetch es idempotente.
    const stateHandler = (event: {
      company: string
      origin_socket_id?: string | null
    }) => {
      if (event.company !== normalizedCompany) return

      // La sesión que hizo el cambio ya lo aplicó de forma optimista; refetchear
      // aquí es lo que revertía visualmente la notificación recién leída.
      if (event.origin_socket_id && event.origin_socket_id === getSocketId()) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: ['notifications', normalizedCompany],
      })
    }

    channel.listen('.new-notification', handler)
    channel.listen('.notifications-state-changed', stateHandler)

    return () => {
      // Se pasa el handler: sin él Echo borra los listeners de las demás
      // instancias del hook, que comparten este mismo canal.
      channel.stopListening('.new-notification', handler)
      channel.stopListening('.notifications-state-changed', stateHandler)
      release()
    }
  }, [isReady, normalizedUserId, normalizedCompany, queryClient])

  // Referencia estable: un `?? []` inline crea un array nuevo por render y
  // dispara efectos que dependan de `notifications`.
  const notifications = query.data ?? EMPTY_NOTIFICATIONS

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