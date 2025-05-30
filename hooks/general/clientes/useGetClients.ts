"use client"

import axiosInstance from '@/lib/axios';
import { Client } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchClients = async (company: string | undefined): Promise<Client[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/clients-administration`);
  return data;
};

export const useGetClients = (company: string | undefined) => {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => fetchClients(company),
    staleTime: 1000 * 60 * 2, // 5 minutos
    enabled: !!company,
  });
};
