'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Notification = {
  id: string
}

interface Params {
  notifications: Notification[]
  unreadCount: number
  open?: boolean
  scopeKey?: string | number
}

const UNLOCK_EVENTS: (keyof WindowEventMap)[] = [
  'pointerdown',
  'keydown',
  'touchstart',
]

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

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)
  const pendingPlayRef = useRef(false)

  const baseTitleRef = useRef('')
  const titleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Inicialización (audio + unlock + config por usuario)
   */
  useEffect(() => {
    const isDipSuperUser =
      user?.roles?.some(role => role.name === 'SUPERUSER') &&
      user?.employee?.some(emp => emp.department?.acronym === 'DIP')

    const audioPath = isDipSuperUser
      ? '/sounds/faaah.mp3'
      : '/sounds/notification-cabine.mp3'

    const audio = new Audio(audioPath)

    audio.preload = 'auto'
    audio.volume = 1

    audioRef.current = audio
    audioUnlockedRef.current = false
    baseTitleRef.current = document.title

    /**
     * Unlock de audio (obligatorio por políticas del browser).
     * Cualquier gesto del usuario (click, tecla, touch) sirve para
     * destrabar el audio. Si llegó una notificación mientras estaba
     * bloqueado, se reproduce inmediatamente al desbloquear.
     */
    const unlockAudio = () => {
      if (!audioRef.current || audioUnlockedRef.current) return

      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause()
          if (audioRef.current) audioRef.current.currentTime = 0

          audioUnlockedRef.current = true
          UNLOCK_EVENTS.forEach(evt =>
            window.removeEventListener(evt, unlockAudio)
          )

          if (pendingPlayRef.current) {
            pendingPlayRef.current = false
            audioRef.current?.play().catch(() => {
              // silencioso
            })
          }
        })
        .catch(() => {
          // el navegador sigue bloqueando: se reintenta en el próximo gesto
        })
    }

    UNLOCK_EVENTS.forEach(evt =>
      window.addEventListener(evt, unlockAudio, { passive: true })
    )

    return () => {
      UNLOCK_EVENTS.forEach(evt =>
        window.removeEventListener(evt, unlockAudio)
      )

      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [user])

  const setBurstTitle = (count: number) => {
    const label =
      count === 1 ? 'Nueva notificación' : 'Nuevas notificaciones'

    document.title = `(${count}) ${label} - SIGEAC`

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }

    titleTimeoutRef.current = setTimeout(() => {
      document.title =
        count > 0 ? `(${count}) - SIGEAC` : baseTitleRef.current
    }, 4000)
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
      pendingPlayRef.current = false
      return
    }

    const newIds = currentIds.filter(id => !prevIdsRef.current.includes(id))

    const shouldTrigger =
      newIds.length > 0 && unreadCount > prevUnreadRef.current

    /**
     * Sonido
     */
    if (shouldTrigger && audioRef.current) {
      if (audioUnlockedRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {
          // silencioso
        })
      } else {
        // Aún no hubo gesto del usuario: se reproduce en cuanto se desbloquee
        pendingPlayRef.current = true
      }
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
  }, [notifications, unreadCount, open, scopeKey])
}
