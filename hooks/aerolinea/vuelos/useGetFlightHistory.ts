"use client"

import axiosInstance from "@/lib/axios";
import { FlightHistory } from '@/types';
import { useQuery } from '@tanstack/react-query';

export interface FlightHistoryResponse {
  data: FlightHistory[];
  total: number;
}

const fetchFlightHistory = async (
  company?: string,
  acronym?: string
): Promise<FlightHistoryResponse> => {
  const { data } = await axiosInstance.get(`/${company}/flight-history/${acronym}`);
 
  // Si el backend retorna un array directo, transformarlo al formato esperado
  if (Array.isArray(data)) {
    return {
      data: data,
      total: data.length,
    };
  }

  return data;
};

export const useGetFlightHistory = (
  company?: string,
  acronym?: string
) => {
  return useQuery<FlightHistoryResponse, Error>({
    queryKey: ['flight-history', company, acronym],
    queryFn: () => fetchFlightHistory(company, acronym),
    refetchOnWindowFocus: false,
    enabled: !!company && !!acronym,
  });
};
