"use client"

import axiosInstance from '@/lib/axios';
import { Renting } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchRenting = async (): Promise<Renting[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/rentings');
  return data;
};

export const useGetRenting = () => {
  return useQuery<Renting[]>({
    queryKey: ['renting'],
    queryFn: fetchRenting,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};