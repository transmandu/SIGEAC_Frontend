"use client"

import type { BankAccount } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchBankAccountById = async (id: string): Promise<BankAccount> => {
  const { data } = await axiosInstance.get(`/bank-accounts/${id}`)
  return data
}

export const useGetBankAccountById = (id: string) => {
  return useQuery<BankAccount>({
    queryKey: ["bank-account", id],
    queryFn: () => fetchBankAccountById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}