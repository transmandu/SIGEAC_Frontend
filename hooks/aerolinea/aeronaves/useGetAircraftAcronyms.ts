"use client"

import { Aircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

const fetchAircrafts = async (company: string | undefined): Promise<Aircraft[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/aircraft-acronyms`);
  return data;
};

export const useGetAircraftAcronyms = (company: string | undefined) => {
  return useQuery<Aircraft[]>({
    queryKey: ['aircrafts'],
    queryFn: () => fetchAircrafts(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
