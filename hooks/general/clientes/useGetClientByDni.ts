"use client"

import type { Client } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchClientsByDni = async (dni: string): Promise<Client> => {
  const { data } = await axiosInstance.get(`/transmandu/clients-administration/${dni}`)
  return data
}

export const useGetClientByDni = (dni: string) => {
  return useQuery<Client>({
    queryKey: ["clients", dni],
    queryFn: () => fetchClientsByDni(dni),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!dni, // Solo ejecuta la consulta si hay un ID
  })
}
