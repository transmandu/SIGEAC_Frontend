"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCreditSell = async (): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/credits-with-sells');
  return data;
};

export const useGetCreditSell = () => {
  return useQuery<Credit[]>({
    queryKey: ['credit-sell'],
    queryFn: fetchCreditSell,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};