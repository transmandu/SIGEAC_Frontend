import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Sincronizacion de la cache de React Query entre pestañas del mismo navegador.
 *
 * Cada pestaña tiene su propia cache en memoria, asi que una mutacion en la
 * pestaña A dejaba a la B mostrando datos viejos hasta que se refrescara. Aqui
 * se replica la invalidacion: A publica que una key quedo obsoleta y B la
 * invalida en su propia cache.
 *
 * Es generico a proposito — no sabe de notificaciones ni de ningun modulo — y
 * se engancha una sola vez al QueryCache, de modo que cualquier
 * `invalidateQueries` existente o futuro queda sincronizado sin tocar el hook.
 *
 * Limite conocido: una query configurada con `refetchOnMount: false` que no
 * tenga ningun componente montado queda marcada como invalidada pero no se
 * refresca al volver a montarse (React Query cortocircuita en esa opcion antes
 * de mirar `isInvalidated`). En la practica no afecta a las listas que se ven
 * en pantalla, que son las que importan para este problema.
 */

const CHANNEL_NAME = 'sigeac-query-sync'

type SyncMessage = {
  /** Identifica a la pestaña emisora para que ignore su propio mensaje. */
  origin: string
  queryKey: QueryKey
  /** Refleja el `exact` del invalidateQueries original. */
  exact: boolean
}

const TAB_ID =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

let channel: BroadcastChannel | null = null

const getChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null
  }

  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
    } catch {
      // Algunos navegadores lo bloquean con cookies de terceros deshabilitadas.
      return null
    }
  }

  return channel
}

/**
 * Solo se replican keys serializables: una key con funciones, clases o
 * referencias del DOM reventaria el structured clone del BroadcastChannel y
 * tumbaria la invalidacion local que ya ocurrio.
 */
const isCloneable = (queryKey: QueryKey): boolean => {
  try {
    JSON.stringify(queryKey)
    return true
  } catch {
    return false
  }
}

const publish = (queryKey: QueryKey, exact: boolean) => {
  const bc = getChannel()

  if (!bc || !isCloneable(queryKey)) return

  const message: SyncMessage = { origin: TAB_ID, queryKey, exact }

  try {
    bc.postMessage(message)
  } catch {
    // Un fallo al publicar no debe romper la pestaña que hizo la mutacion:
    // la otra simplemente se entera al refrescar, como antes.
  }
}

/**
 * Conecta el QueryClient al canal. Devuelve la funcion de limpieza.
 */
export const setupCrossTabSync = (queryClient: QueryClient): (() => void) => {
  const bc = getChannel()

  if (!bc) return () => {}

  // Marca las invalidaciones que llegan de otra pestaña, para no reenviarlas y
  // provocar un ida y vuelta entre las dos.
  let applyingRemote = false

  const unsubscribe = queryClient.getQueryCache().subscribe(event => {
    if (applyingRemote) return
    if (event.type !== 'updated') return
    if (event.action.type !== 'invalidate') return

    publish(event.query.queryKey, false)
  })

  const onMessage = (event: MessageEvent<SyncMessage>) => {
    const message = event.data

    if (!message || typeof message !== 'object') return
    if (message.origin === TAB_ID) return
    if (!Array.isArray(message.queryKey)) return

    applyingRemote = true

    try {
      queryClient.invalidateQueries({
        queryKey: message.queryKey,
        exact: message.exact,
        // Solo lo que hay en pantalla. Sin esto, una key sin observadores
        // quedaria marcada como invalidada y, si ademas usa
        // `refetchOnMount: false`, no se refrescaria nunca al volver a montarse.
        refetchType: 'active',
      })
    } finally {
      // El flag basta con que sea sincrono: `invalidate()` despacha la accion en
      // el acto, y el refetch posterior emite 'fetch'/'success', nunca
      // 'invalidate', asi que no se reenvia.
      applyingRemote = false
    }
  }

  bc.addEventListener('message', onMessage)

  return () => {
    unsubscribe()
    bc.removeEventListener('message', onMessage)
  }
}

/**
 * Propaga a las demas pestañas un cambio que NO paso por `invalidateQueries`,
 * tipicamente un update optimista via `setQueryData`. La otra pestaña no puede
 * reaplicar el update (no conoce la funcion updater), asi que refetchea la key.
 */
export const broadcastQueryInvalidation = (
  queryKey: QueryKey,
  exact = false
) => {
  publish(queryKey, exact)
}
