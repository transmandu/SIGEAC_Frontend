"use client"

import { Route } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const fetchRoute = async (): Promise<Route[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/route');
  return data;
};

export const useGetRoute = () => {
  return useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: fetchRoute,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};