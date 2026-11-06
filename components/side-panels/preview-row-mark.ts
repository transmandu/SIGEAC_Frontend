import { useEffect, useMemo, useState } from 'react'

/**
 * Marca de la fila del documento cuyo panel lateral se abrió.
 *
 * - "active": su panel está abierto.
 * - "recent": se cerró y es la última que se abrió.
 * - "fading": se está apagando; la tabla anima ese paso poco a poco.
 */
export type PreviewRowMark = 'active' | 'recent' | 'fading'

/** Cuánto sigue marcada la última fila tras cerrar el panel, antes de empezar a apagarse. */
const RECENT_MARK_MS = 5000
/** Duración del desvanecimiento; la tabla usa la misma (`duration-2500`). */
const FADE_MARK_MS = 2500

export interface LastPreviewMark {
  id: number | null
  fading: boolean
}

export const NO_LAST_PREVIEW_MARK: LastPreviewMark = { id: null, fading: false }

/**
 * Recuerda cuál fue la última fila abierta y la va apagando una vez cerrado el
 * panel: al volver a la tabla se ve de un vistazo cuál se estaba revisando. Si
 * se abre otra, la marca pasa a esa de inmediato.
 */
export function useLastPreviewMark(panelOpen: boolean) {
  const [lastId, setLastId] = useState<number | null>(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (panelOpen || lastId === null) return

    const startFade = setTimeout(() => setFading(true), RECENT_MARK_MS)
    const clear = setTimeout(() => {
      setLastId(null)
      setFading(false)
    }, RECENT_MARK_MS + FADE_MARK_MS)

    return () => {
      clearTimeout(startFade)
      clearTimeout(clear)
    }
  }, [panelOpen, lastId])

  const last = useMemo<LastPreviewMark>(
    () => ({ id: lastId, fading }),
    [lastId, fading]
  )

  const markOpened = (id: number) => {
    setLastId(id)
    setFading(false)
  }

  return { last, markOpened }
}

export function resolvePreviewRowMark(
  id: number,
  openId: number | null,
  last: LastPreviewMark
): PreviewRowMark | undefined {
  if (id === openId) return 'active'
  if (id === last.id) return last.fading ? 'fading' : 'recent'
  return undefined
}
