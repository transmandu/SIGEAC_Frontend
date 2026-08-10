"use client"

import { CashMovement } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

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

const fetchOutputStatistics = async (company?: string): Promise<OutputStatistics> => {
  const { data } = await axiosInstance.get(`/${company}/output-statistics`)
  return data
}

export const useGetOutputStatistics = (company?: string) => {
  return useQuery<OutputStatistics>({
    queryKey: ["output-statistics"],
    queryFn: () => fetchOutputStatistics(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company 
  })
}
