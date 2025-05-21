"use client"

import { CashMovement } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

// Definir la estructura de datos que devuelve el endpoint
export interface IncomeStatistics {
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

const fetchIncomeStatistics = async (): Promise<IncomeStatistics> => {
    const { data } = await axiosInstance.get("/transmandu/income-statistics")
    return data
}
  
export const useGetIncomeStatistics = () => {
    return useQuery<IncomeStatistics>({
      queryKey: ["income-statistics"],
      queryFn: fetchIncomeStatistics,
      staleTime: 1000 * 60 * 5, // 5 minutos
    })
}