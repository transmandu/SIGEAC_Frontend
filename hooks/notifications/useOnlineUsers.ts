import { useEffect, useMemo, useState } from 'react'
import { getEcho } from '@/lib/echo'

export interface OnlineUser {
  id: number
  name: string
}

export type PresenceStatus = 'online' | 'standby' | 'offline'

const WHISPER_EVENT = 'focus-state'

/**
 * Se une al presence channel presence-online-users.{company} (ver
 * routes/channels.php en el backend). Reverb mantiene la lista de miembros
 * conectados en el propio servidor: .here() trae la lista inicial y
 * .joining()/.leaving() la mantienen actualizada mientras el socket viva,
 * sin polling ni heartbeats HTTP.
 *
 * "Conectado" no es lo mismo que "en primer plano": una pestaña puede seguir
 * con el socket abierto en segundo plano. Para distinguirlo, cada cliente
 * reporta su document.visibilityState a los demás miembros del canal via
 * whisper (evento cliente-a-cliente sobre el mismo socket, sin request HTTP
 * adicional ni servidor de por medio), y todos escuchan los whispers del
 * resto para saber quien esta realmente con la pestaña visible.
 */
export const useOnlineUsers = (company?: string, enabled: boolean = true) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [focusedUserIds, setFocusedUserIds] = useState<Set<number>>(new Set())

  const normalizedCompany = company?.trim() ?? ''

  useEffect(() => {
    if (!enabled || !normalizedCompany) {
      setOnlineUsers([])
      setFocusedUserIds(new Set())
      return
    }

    const echoInstance = getEcho()
    if (!echoInstance) return

    const channelName = `presence-online-users.${normalizedCompany}`
    const channel = echoInstance.join(channelName)

    const setFocused = (userId: number, focused: boolean) => {
      setFocusedUserIds((prev) => {
        const next = new Set(prev)
        if (focused) next.add(userId)
        else next.delete(userId)
        return next
      })
    }

    const broadcastVisibility = () => {
      channel.whisper(WHISPER_EVENT, {
        focused: document.visibilityState === 'visible',
      })
    }

    channel
      .here((users: OnlineUser[]) => {
        setOnlineUsers(users)
        broadcastVisibility()
      })
      .joining((user: OnlineUser) => {
        setOnlineUsers((prev) =>
          prev.some((u) => u.id === user.id) ? prev : [...prev, user]
        )
      })
      .leaving((user: OnlineUser) => {
        setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id))
        setFocused(user.id, false)
      })
      .listenForWhisper(
        WHISPER_EVENT,
        (payload: { focused: boolean }, user: OnlineUser) => {
          setFocused(user.id, payload.focused)
        }
      )

    document.addEventListener('visibilitychange', broadcastVisibility)

    return () => {
      document.removeEventListener('visibilitychange', broadcastVisibility)
      echoInstance.leave(channelName)
      setOnlineUsers([])
      setFocusedUserIds(new Set())
    }
  }, [enabled, normalizedCompany])

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers]
  )

  const getPresenceStatus = (userId: number | string): PresenceStatus => {
    const id = Number(userId)
    if (!onlineUserIds.has(id)) return 'offline'
    return focusedUserIds.has(id) ? 'online' : 'standby'
  }

  const isUserOnline = (userId: number | string) =>
    getPresenceStatus(userId) !== 'offline'

  return { onlineUsers, isUserOnline, getPresenceStatus }
}
