'use client'

import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider as RQQueryClientProvider } from '@tanstack/react-query';
import { setupCrossTabSync } from '@/lib/cross-tab-sync';

const makeQueryClient = () =>
  new QueryClient({
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

  return <RQQueryClientProvider client={queryClient}>{children}</RQQueryClientProvider>;
};

export default QueryClientProvider;
