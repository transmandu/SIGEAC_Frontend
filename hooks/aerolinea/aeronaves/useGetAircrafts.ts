"use client"

import { Aircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const fetchAircrafts = async (): Promise<Aircraft[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/aircrafts-administration');
  return data;
}; 

export const useGetAircrafts = () => {
  return useQuery<Aircraft[]>({
    queryKey: ['aircrafts'],
    queryFn: fetchAircrafts,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};  