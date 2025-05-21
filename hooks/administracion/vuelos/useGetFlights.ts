"use client"

import { Flight } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"
import { useSearchParams } from 'next/navigation';

export const useGetFlights = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  return useQuery<Flight[], Error>({
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