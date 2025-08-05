"use client"

import axiosInstance from '@/lib/axios';
import { Renting } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchRenting = async (company?: string): Promise<Renting[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/rentings`);
  return data;
};

export const useGetRenting = (company?: string) => {
  return useQuery<Renting[]>({
    queryKey: ['renting'],
    queryFn: () => fetchRenting(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta la consulta si hay una empresa
  });
};
