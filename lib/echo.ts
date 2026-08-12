import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axiosInstance from '@/lib/axios'

declare global {
  interface Window {
    __echo?: Echo
    Pusher: any
  }
}

const createEcho = () => {
  if (typeof window === 'undefined') return null

  window.Pusher = Pusher

  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,

    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,

    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),

    forceTLS:
      process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',

    enabledTransports: ['ws', 'wss'],
    disableStats: true,

    authorizer: (channel: any) => ({
      authorize: (socketId: string, callback: Function) => {
        axiosInstance
          .post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then(res => callback(false, res.data))
          .catch(err => {
            console.error('Broadcast auth error:', err)
            callback(true, err)
          })
      },
    }),
  })
}

export const getEcho = (): Echo | null => {
  if (typeof window === 'undefined') return null

  if (!window.__echo) {
    window.__echo = createEcho() as Echo
  }

  return window.__echo
}

/**
 * Id de la conexión actual, para mandarlo como X-Socket-Id y que el servidor
 * marque de quién salió el cambio. Es null hasta que el socket conecta.
 */
export const getSocketId = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    return window.__echo?.socketId() ?? null
  } catch {
    return null
  }
}

// Cuántos suscriptores tiene cada canal. `leave()` desuscribe el canal entero a
// nivel de conexión, así que un hook montado en varios componentes a la vez
// (la campana, el panel y la página de notificaciones usan el mismo) se quedaba
// sin eventos en cuanto uno solo de ellos se desmontaba.
const channelSubscribers = new Map<string, number>()

/**
 * Descarta la conexión y el conteo de canales. Al cerrar sesión la instancia de
 * Echo se destruye: dejar contadores vivos haría que el próximo login creyera
 * que los canales ya tienen suscriptores.
 */
export const resetEcho = () => {
  if (typeof window === 'undefined') return

  window.__echo?.disconnect()
  window.__echo = undefined

  channelSubscribers.clear()
}

/**
 * Reserva el canal para un suscriptor más. Devuelve la función de liberación,
 * que solo abandona el canal cuando se va el último.
 */
export const retainPrivateChannel = (channelName: string) => {
  const echoInstance = getEcho()

  if (!echoInstance) return { channel: null, release: () => {} }

  const channel = echoInstance.private(channelName)

  channelSubscribers.set(
    channelName,
    (channelSubscribers.get(channelName) ?? 0) + 1
  )

  let released = false

  const release = () => {
    // Un cleanup de React puede correr dos veces (StrictMode); sin este guard
    // el contador bajaría de más y el canal moriría con suscriptores vivos.
    if (released) return
    released = true

    const remaining = (channelSubscribers.get(channelName) ?? 1) - 1

    if (remaining > 0) {
      channelSubscribers.set(channelName, remaining)
      return
    }

    channelSubscribers.delete(channelName)
    echoInstance.leave(channelName)
  }

  return { channel, release }
}
