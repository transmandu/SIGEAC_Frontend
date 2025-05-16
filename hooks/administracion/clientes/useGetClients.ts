"use client"

import axiosInstance from '@/lib/axios';
import { Client } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchClients = async (): Promise<Client[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/clients-administration');
  return data;
};

export const useGetClients = () => {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};