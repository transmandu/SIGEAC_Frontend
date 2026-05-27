import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axiosInstance from '@/lib/axios'

if (typeof window !== 'undefined') {
  window.Pusher = Pusher
}

const echo =
  typeof window !== 'undefined'
    ? new Echo({
        broadcaster: 'reverb',

        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,

        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,

        wsPort: Number(
          process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080
        ),

        wssPort: Number(
          process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080
        ),

        forceTLS:
          (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') ===
          'https',

        enabledTransports: ['ws', 'wss'],

        disableStats: true,

        authorizer: (channel: any) => ({
          authorize: (
            socketId: string,
            callback: (
              error: boolean,
              data?: any
            ) => void
          ) => {
            axiosInstance
              .post('/broadcasting/auth', {
                socket_id: socketId,
                channel_name: channel.name,
              })
              .then((response) => {
                callback(false, response.data)
              })
              .catch((error) => {
                console.error(
                  '❌ Broadcast auth error:',
                  error
                )

                callback(true, error)
              })
          },
        }),
      })
    : null

if (echo) {
  echo.connector.pusher.connection.bind(
    'connected',
    () => {
      console.log('✅ Reverb conectado')
    }
  )

  echo.connector.pusher.connection.bind(
    'error',
    (error: any) => {
      console.error('❌ Reverb error:', error)
    }
  )
}

export default echo