"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCreditRent = async (company?: string): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/credits-with-rents`);
  return data;
};

export const useGetCreditRent = (company?: string) => {
  return useQuery<Credit[]>({
    queryKey: ['credit-rent-payment', company],
    queryFn: () => fetchCreditRent(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company
  });
};
