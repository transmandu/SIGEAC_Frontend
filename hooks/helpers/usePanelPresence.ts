"use client";

import { useEffect, useState } from "react";

/**
 * Presencia de un panel que entra y sale con una transición CSS de `transform`
 * (ver `.panel-slide-right` en globals.css).
 *
 * Por qué transición y no keyframes: una transición se puede interrumpir. Si el
 * panel se abre y se cierra (o se reabre) a mitad de camino, el navegador
 * invierte el movimiento desde donde está, sin saltos ni reinicios.
 *
 * - `mounted`: el panel está en el DOM (incluye lo que dura la salida).
 * - `state`: "open" solo después de pintar el panel fuera de pantalla; sin ese
 *   fotograma de partida no habría nada que animar.
 * - `ready`: pasó el tiempo de la entrada; sirve para diferir lo pesado.
 */
export function usePanelPresence(open: boolean, exitMs = 240, enterMs = 300) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);

  // Montar se deriva de `open`: el panel nace en el mismo commit en que se pide.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setEntered(true));
      });
      const readyTimer = setTimeout(() => setReady(true), enterMs);

      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
        clearTimeout(readyTimer);
      };
    }

    const exitTimer = setTimeout(() => {
      setMounted(false);
      setEntered(false);
      setReady(false);
    }, exitMs);

    return () => clearTimeout(exitTimer);
  }, [open, exitMs, enterMs]);

  return {
    mounted,
    state: open && entered ? "open" : "closed",
    ready: open && ready,
  } as const;
}
