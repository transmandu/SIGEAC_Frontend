"use client"

import type { Cash } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCashById = async (id: string, company?: string): Promise<Cash> => {
  const { data } = await axiosInstance.get(`/${company}/cash/${id}`)
  return data
}

export const useGetCashById = (id: string, company?: string) => {
  return useQuery<Cash>({
    queryKey: ["cash", id, company],
    queryFn: () => fetchCashById(id, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company,
  })
}
