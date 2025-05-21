"use client"

import type { Client } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchClientsAddBalanceById = async (id: string): Promise<Client> => {
  const { data } = await axiosInstance.get(`/transmandu/clients-add-balance/${id}`)
  return data
}

export const useGetClientAddBalanceById = (id: string) => {
  return useQuery<Client>({
    queryKey: ["balance", id],
    queryFn: () => fetchClientsAddBalanceById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}
