'use client'

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider as RQQueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

const QueryClientProvider = ({ children }: Props) => {
  return <RQQueryClientProvider client={queryClient}>{children}</RQQueryClientProvider>;
};

export default QueryClientProvider;
