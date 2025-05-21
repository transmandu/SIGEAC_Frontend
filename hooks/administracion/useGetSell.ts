"use client"

import { Sell } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchSell = async (): Promise<Sell[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/sells');
  return data;
};

export const useGetSell = () => {
  return useQuery<Sell[]>({
    queryKey: ['sell'],
    queryFn: fetchSell,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};