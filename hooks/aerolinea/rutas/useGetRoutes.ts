"use client"

import { Route } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const fetchRoute = async (company?: string): Promise<Route[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/route`);
  return data;
};

export const useGetRoute = (company?: string) => {
  return useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: () => fetchRoute(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta la consulta si hay una empresa
  });
};
