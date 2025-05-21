"use client"

import { CashMovement } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

// Definir la estructura de datos que devuelve el endpoint
export interface OutputStatistics {
  statistics: {
    total_annual: number
    monthly: {
      [yearNumber: string]: {
        [month: string]: number
      }
    }
  }
  cash_movements: {
    [year: string]: {
      [month: string]: CashMovement[]
    }
  }
}

const fetchOutputStatistics = async (): Promise<OutputStatistics> => {
  const { data } = await axiosInstance.get("/transmandu/output-statistics")
  return data
}
  
export const useGetOutputStatistics = () => {
  return useQuery<OutputStatistics>({
    queryKey: ["output-statistics"],
    queryFn: fetchOutputStatistics,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}