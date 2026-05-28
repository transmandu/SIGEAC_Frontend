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
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),

    forceTLS:
      (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',

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