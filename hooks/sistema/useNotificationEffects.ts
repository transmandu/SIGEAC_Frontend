'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { setBurst, setUnreadCount } from '@/lib/document-title'
import {
  createNotificationPlayer,
  type NotificationPlayer,
} from '@/lib/notification-audio'

type Notification = {
  id: string
}

interface Params {
  notifications: Notification[]
  unreadCount: number
  open?: boolean
  scopeKey?: string | number
}

export function useNotificationEffects({
  notifications,
  unreadCount,
  open = false,
  scopeKey,
}: Params) {
  const { user } = useAuth()

  const prevIdsRef = useRef<string[]>([])
  const prevUnreadRef = useRef(0)
  const isFirstLoadRef = useRef(true)
  const scopeKeyRef = useRef(scopeKey)

  const playerRef = useRef<NotificationPlayer | null>(null)

  const titleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Solo la ruta del sonido: depender de `user` entero recrearía el
  // reproductor (y perdería el desbloqueo) en cada refetch de sesión.
  const audioPath = useMemo(() => {
    const isDipSuperUser =
      user?.roles?.some(role => role.name === 'SUPERUSER') &&
      user?.employee?.some(emp => emp.department?.acronym === 'DIP')

    return isDipSuperUser
      ? '/sounds/faaah.mp3'
      : '/sounds/notification-cabine.mp3'
  }, [user])

  useEffect(() => {
    const player = createNotificationPlayer(audioPath)
    playerRef.current = player

    return () => {
      player.dispose()
      playerRef.current = null
    }
  }, [audioPath])

  useEffect(() => {
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
        setBurst(null)
      }
    }
  }, [])

  const setBurstTitle = (count: number) => {
    setUnreadCount(count)
    setBurst(count === 1 ? 'Nueva notificación' : 'Nuevas notificaciones')

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }

    titleTimeoutRef.current = setTimeout(() => setBurst(null), 4000)
  }

  /**
   * Detectar nuevas notificaciones (websocket / react-query / polling)
   */
  useEffect(() => {
    const currentIds = notifications?.map(n => n.id) ?? []

    const scopeChanged = scopeKeyRef.current !== scopeKey

    if (isFirstLoadRef.current || scopeChanged) {
      prevIdsRef.current = currentIds
      prevUnreadRef.current = unreadCount
      isFirstLoadRef.current = false
      scopeKeyRef.current = scopeKey

      // Sin sonido ni burst, pero el contador de la pestaña sí debe reflejar
      // lo que ya había pendiente al entrar o al cambiar de compañía.
      setUnreadCount(unreadCount)
      return
    }

    const newIds = currentIds.filter(id => !prevIdsRef.current.includes(id))

    const shouldTrigger =
      newIds.length > 0 && unreadCount > prevUnreadRef.current

    /**
     * Sonido
     */
    if (shouldTrigger) {
      playerRef.current?.play()
    }

    /**
     * Título
     */
    if (!open) {
      if (shouldTrigger) {
        setBurstTitle(unreadCount)
      } else {
        setUnreadCount(unreadCount)
      }
    } else {
      // Con el panel abierto no hay burst, pero el contador baja al leerlas.
      setBurst(null)
      setUnreadCount(unreadCount)
    }

    prevIdsRef.current = currentIds
    prevUnreadRef.current = unreadCount
  }, [notifications, unreadCount, open, scopeKey])
}
