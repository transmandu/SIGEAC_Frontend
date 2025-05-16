"use client"

import type { Client } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchClientsById = async (id: string): Promise<Client> => {
  const { data } = await axiosInstance.get(`/transmandu/clients-administration/${id}`)
  return data
}

export const useGetClientById = (id: string) => {
  return useQuery<Client>({
    queryKey: ["clients", id],
    queryFn: () => fetchClientsById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}
