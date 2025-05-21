"use client"

import type { Sell } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchSellById = async (id: string): Promise<Sell> => {
  const { data } = await axiosInstance.get(`/transmandu/sells/${id}`)
  return data
}

export const useGetSellById = (id: string) => {
  return useQuery<Sell>({
    queryKey: ["sell", id],
    queryFn: () => fetchSellById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}
