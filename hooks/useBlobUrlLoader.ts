import { useEffect, useEffectEvent, useState } from "react";

interface Loaded {
  signature: string;
  url: string | null;
}

/**
 * Carga un archivo como `blob:` URL y la libera cuando deja de hacer falta.
 *
 * `load` devuelve la URL ya creada (quien la pide decide cómo traer el archivo).
 * `signature` identifica *qué* se está cargando: mientras sea `null` no se pide
 * nada (visor cerrado) y cuando cambia se descarta lo anterior y se pide de
 * nuevo. Una respuesta lenta de una carga anterior se ignora y su URL se revoca,
 * así no pisa el documento que se está viendo ahora.
 *
 * El resultado queda ligado a la `signature` con que se pidió; "cargando" es
 * simplemente que todavía no hay resultado para la `signature` actual, de modo
 * que ningún estado se reinicia dentro del efecto.
 */
export function useBlobUrlLoader(
  load: () => Promise<string>,
  signature: string | null,
) {
  const [retryCount, setRetryCount] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  // Siempre la última función de carga, sin volverla dependencia del efecto: si
  // quien llama la pasa inline, no se debe recargar en cada render.
  const run = useEffectEvent(load);

  const attempt = signature === null ? null : `${signature}#${retryCount}`;

  useEffect(() => {
    if (attempt === null) return;

    let cancelled = false;
    let created: string | null = null;

    run()
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        created = url;
        setLoaded({ signature: attempt, url });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ signature: attempt, url: null });
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [attempt]);

  const current = loaded?.signature === attempt ? loaded : null;

  return {
    url: current?.url ?? null,
    loading: attempt !== null && current === null,
    failed: current !== null && current.url === null,
    retry: () => setRetryCount((count) => count + 1),
  };
}
