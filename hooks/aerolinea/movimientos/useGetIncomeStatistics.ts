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

const fetchIncomeStatistics = async (company?: string): Promise<IncomeStatistics> => {
    const { data } = await axiosInstance.get(`/${company}/income-statistics`)
    return data
}

export const useGetIncomeStatistics = (company?: string) => {
    return useQuery<IncomeStatistics>({
      queryKey: ["income-statistics"],
      queryFn: () => fetchIncomeStatistics(company),
      staleTime: 1000 * 60 * 5, // 5 minutos
      enabled: !!company // Solo ejecuta la consulta si hay una empresa
    })
}
