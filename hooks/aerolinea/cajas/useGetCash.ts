"use client"

import { Cash } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

const fetchCash = async (company?: string): Promise<Cash[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/cash`);
  return data;
};

export const useGetCash = (company?: string) => {
  return useQuery<Cash[]>({
    queryKey: ['cashes'],
    queryFn:  () => fetchCash(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
