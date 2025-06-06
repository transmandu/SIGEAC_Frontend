"use client"

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export type AircraftAcronym = {
  id: number;
  acronym: string;
}

const fetchAircrafts = async (): Promise<AircraftAcronym[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/aircraft-acronyms');
  return data;
}; 

export const useGetAircraftAcronyms = () => {
  return useQuery<AircraftAcronym[]>({
    queryKey: ['aircraft-acronyms'],
    queryFn: fetchAircrafts,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};  