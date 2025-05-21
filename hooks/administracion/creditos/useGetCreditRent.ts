"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCreditRent = async (): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/credits-with-rents');
  return data;
};

export const useGetCreditRent = () => {
  return useQuery<Credit[]>({
    queryKey: ['credit-rent-payment'],
    queryFn: fetchCreditRent,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};