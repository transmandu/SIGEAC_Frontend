"use client"

import { Credit } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCredit = async (): Promise<Credit[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/credits-with-vendors');
  return data;
};

export const useGetCredit = () => {
  return useQuery<Credit[]>({
    queryKey: ['credits'],
    queryFn: fetchCredit,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};