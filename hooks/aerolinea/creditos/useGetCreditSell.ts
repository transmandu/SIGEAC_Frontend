"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCreditSell = async (company?: string): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/credits-with-sells`);
  return data;
};

export const useGetCreditSell = (company?: string) => {
  return useQuery<Credit[]>({
    queryKey: ['credit-sell'],
    queryFn: () => fetchCreditSell(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta la consulta si hay una empresa
  });
};
