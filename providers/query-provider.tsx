"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider as RQQueryClientProvider,
} from "@tanstack/react-query";
import { setupCrossTabSync } from "@/lib/cross-tab-sync";
import { describeApiError, type ApiErrorKind } from "@/lib/api-error";
import { notifyError } from "@/lib/notify-error";

/**
 * Fallos de una consulta que la pantalla no puede explicar por su cuenta: la
 * red, el servidor o la configuración del sistema. El resto (sin permiso, no
 * existe, validación) ya tiene su estado en la propia pantalla, y avisarlos
 * desde aquí duplicaría el mensaje.
 */
const SYSTEM_KINDS: ReadonlySet<ApiErrorKind> = new Set([
  "offline",
  "timeout",
  "unreachable",
  "unavailable",
  "endpointMissing",
  "schema",
  "database",
  "external",
  "server",
]);

/** Una consulta que se repite sola (notificaciones) no debe reabrir el aviso cada pocos segundos. */
const REPEAT_AFTER_MS = 30_000;
const lastShown = new Map<ApiErrorKind, number>();

const notifyQueryError = (error: unknown, silent: unknown) => {
  if (silent) return;

  const { kind, silent: cancelled } = describeApiError(error);
  if (cancelled || !SYSTEM_KINDS.has(kind)) return;

  const now = Date.now();
  if (now - (lastShown.get(kind) ?? 0) < REPEAT_AFTER_MS) return;
  lastShown.set(kind, now);

  notifyError(error, { dedupe: true });
};

const makeQueryClient = () =>
  new QueryClient({
    // Una consulta con `meta: { silent: true }` se encarga de su propio error.
    queryCache: new QueryCache({
      onError: (error, query) => notifyQueryError(error, query.meta?.silent),
    }),
    defaultOptions: {
      queries: {
        // Sin esto el default es 0: cada navegación remontaba las queries de la
        // página y las volvía a pedir, aunque los datos acabaran de llegar.
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,

        // Volver a la pestaña no es motivo para recargar: las invalidaciones
        // explícitas (y el cross-tab sync) son las que marcan qué está viejo.
        refetchOnWindowFocus: false,

        // Se mantiene true, pero ahora solo dispara si la query está stale.
        refetchOnMount: true,
        refetchOnReconnect: true,

        retry: 1,
      },
    },
  });

interface Props {
  children: ReactNode;
}

const QueryClientProvider = ({ children }: Props) => {
  // En el App Router el módulo puede compartirse entre requests: un cliente por
  // montaje evita que la caché de un usuario se filtre a otro.
  const [queryClient] = useState(makeQueryClient);

  // Toda invalidacion de cache se replica al resto de pestañas abiertas, para
  // que no queden mostrando datos que ya cambiaron en otra.
  useEffect(() => setupCrossTabSync(queryClient), [queryClient]);

  return (
    <RQQueryClientProvider client={queryClient}>
      {children}
    </RQQueryClientProvider>
  );
};

export default QueryClientProvider;
