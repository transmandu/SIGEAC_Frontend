"use client"

import { CashMovement } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"
import { useSearchParams } from 'next/navigation';

export const useGetCashMovements = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  return useQuery<CashMovement[], Error>({
    queryKey: ['cash-movements', from, to],
    queryFn: async () => {
      const  {data}  = await axiosInstance.get('/transmandu/cash-movements', {
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