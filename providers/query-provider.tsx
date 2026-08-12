'use client'

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider as RQQueryClientProvider } from '@tanstack/react-query';
import { setupCrossTabSync } from '@/lib/cross-tab-sync';

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

const QueryClientProvider = ({ children }: Props) => {
  // Toda invalidacion de cache se replica al resto de pestañas abiertas, para
  // que no queden mostrando datos que ya cambiaron en otra.
  useEffect(() => setupCrossTabSync(queryClient), []);

  return <RQQueryClientProvider client={queryClient}>{children}</RQQueryClientProvider>;
};

export default QueryClientProvider;
