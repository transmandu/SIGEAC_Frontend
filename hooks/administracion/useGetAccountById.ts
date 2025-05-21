"use client"

import type { Accountant } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchAccountById = async (id: string): Promise<Accountant> => {
  const { data } = await axiosInstance.get(`/transmandu/accountants/${id}`)
  return data
}

export const useGetAccountById = (id: string) => {
  return useQuery<Accountant>({
    queryKey: ["account", id],
    queryFn: () => fetchAccountById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}