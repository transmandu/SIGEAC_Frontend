"use client"

import { Cash } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCash = async (): Promise<Cash[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/cash');
  return data;
};

export const useGetCash = () => {
  return useQuery<Cash[]>({
    queryKey: ['cashes'],
    queryFn: fetchCash,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};