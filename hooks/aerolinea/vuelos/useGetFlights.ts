"use client"

import axiosInstance from "@/lib/axios";
import { AdministrationFlight } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

export const useGetAdministrationFlights = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  return useQuery<AdministrationFlight[], Error>({
    queryKey: ['credit-flight-payment', from, to],
    queryFn: async () => {
      const  {data}  = await axiosInstance.get('/transmandu/flights', {
      params: {
        from,
        to,
      },
    });
    return data;
  },
  refetchOnWindowFocus: false,
  });
};
