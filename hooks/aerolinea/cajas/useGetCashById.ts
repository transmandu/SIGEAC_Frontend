"use client"

import type { Cash } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCashById = async (id: string): Promise<Cash> => {
  const { data } = await axiosInstance.get(`/transmandu/cash/${id}`)
  return data
}

export const useGetCashById = (id: string) => {
  return useQuery<Cash>({
    queryKey: ["cash", id],
    queryFn: () => fetchCashById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}
