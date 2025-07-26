"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCredit = async (company?: string): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/credits-with-vendors`);
  return data;
};

export const useGetCredit = (company?: string) => {
  return useQuery<Credit[]>({
    queryKey: ['credits', company],
    queryFn: () => fetchCredit(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta la consulta si hay una empresa
  });
};
