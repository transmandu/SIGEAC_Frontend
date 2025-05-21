"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCreditFlight = async (): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/credits-with-flights');
  return data;
};

export const useGetCreditFlight = () => {
  return useQuery<Credit[]>({
    queryKey: ['credit-flight-payment'],
    queryFn: fetchCreditFlight,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};