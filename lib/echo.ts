import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axiosInstance from '@/lib/axios'

declare global {
  interface Window {
    // Highlight-next-line
    __echo?: InstanceType<typeof Echo<'reverb'>> | null
    Pusher: any
  }
}

const createEcho = (): InstanceType<typeof Echo<'reverb'>> | null => {
  if (typeof window === 'undefined') return null

  window.Pusher = Pusher

  return new Echo<'reverb'>({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
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

export const getEcho = (): InstanceType<typeof Echo<'reverb'>> | null => {
  if (typeof window === 'undefined') return null

  if (!window.__echo) {
    window.__echo = createEcho()
  }

  // Highlight-next-line
  return window.__echo ?? null
}
