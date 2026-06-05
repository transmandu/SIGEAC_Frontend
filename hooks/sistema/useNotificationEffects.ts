'use client'

import { useEffect, useRef } from 'react'

type Notification = {
  id: string
}

interface Params {
  notifications: Notification[]
  unreadCount: number
  open?: boolean
}

export function useNotificationEffects({
  notifications,
  unreadCount,
  open = false,
}: Params) {
  const prevIdsRef = useRef<string[]>([])
  const prevUnreadRef = useRef(0)
  const isFirstLoadRef = useRef(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

  const baseTitleRef = useRef('')
  const titleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Inicialización
   */
  useEffect(() => {
    const audio = new Audio('/sounds/notification.mp3')

    audio.preload = 'auto'
    audio.volume = 0.5

    audioRef.current = audio
    baseTitleRef.current = document.title

    /**
     * Desbloquea audio en la primera interacción
     * para evitar NotAllowedError.
     */
    const unlockAudio = async () => {
      if (
        !audioRef.current ||
        audioUnlockedRef.current
      ) {
        return
      }

      try {
        await audioRef.current.play()

        audioRef.current.pause()
        audioRef.current.currentTime = 0

        audioUnlockedRef.current = true

        window.removeEventListener(
          'pointerdown',
          unlockAudio
        )
      } catch {
        // Ignorar silenciosamente.
      }
    }

    window.addEventListener(
      'pointerdown',
      unlockAudio,
      { passive: true }
    )

    return () => {
      window.removeEventListener(
        'pointerdown',
        unlockAudio
      )

      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [])

  const setBurstTitle = (count: number) => {
    const label =
      count === 1
        ? 'Nueva notificación'
        : 'Nuevas notificaciones'

    document.title = `(${count}) ${label} - SIGEAC`

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }

    titleTimeoutRef.current = setTimeout(() => {
      document.title =
        count > 0
          ? `(${count}) - SIGEAC`
          : baseTitleRef.current
    }, 4000)
  }

  /**
   * Detectar nuevas notificaciones
   */
  useEffect(() => {
    const currentIds =
      notifications?.map(n => n.id) ?? []

    if (isFirstLoadRef.current) {
      prevIdsRef.current = currentIds
      prevUnreadRef.current = unreadCount
      isFirstLoadRef.current = false
      return
    }

    const newIds = currentIds.filter(
      id => !prevIdsRef.current.includes(id)
    )

    const shouldTrigger =
      newIds.length > 0 &&
      unreadCount > prevUnreadRef.current

    /**
     * Sonido
     */
    if (
      shouldTrigger &&
      audioUnlockedRef.current &&
      audioRef.current
    ) {
      audioRef.current.currentTime = 0

      audioRef.current.play().catch(() => {
        // Silencioso.
      })
    }

    /**
     * Título
     */
    if (!open) {
      if (shouldTrigger) {
        setBurstTitle(unreadCount)
      } else {
        document.title =
          unreadCount > 0
            ? `(${unreadCount}) - SIGEAC`
            : baseTitleRef.current
      }
    }

    prevIdsRef.current = currentIds
    prevUnreadRef.current = unreadCount
  }, [notifications, unreadCount, open])
}