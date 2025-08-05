"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCreditFlight = async (company?: string): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/credits-with-flights`);
  return data;
};

export const useGetCreditFlight = (company?: string) => {
  return useQuery<Credit[]>({
    queryKey: ['credit-flight-payment'],
    queryFn: () => fetchCreditFlight(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta la consulta si hay una empresa
  });
};
