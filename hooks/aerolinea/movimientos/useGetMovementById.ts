"use client"

import type { CashMovement } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCashMovementById = async (id: string): Promise<CashMovement> => {
  const { data } = await axiosInstance.get(`/transmandu/cash-movements/${id}`)
  return data
}

export const useGetCashMovementById = (id: string) => {
  return useQuery<CashMovement>({
    queryKey: ["cashes-movements", id],
    queryFn: () => fetchCashMovementById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}