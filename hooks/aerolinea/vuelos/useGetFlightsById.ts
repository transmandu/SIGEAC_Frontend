"use client"

import axiosInstance from "@/lib/axios"
import type { Flight } from "@/types"
import { useQuery } from "@tanstack/react-query"

const fetchFlightsById = async (id: string, company?: string): Promise<Flight> => {
  const { data } = await axiosInstance.get(`/${company}/flights/${id}`)
  return data
}

export const useGetFlightById = (id: string, company?: string) => {
  return useQuery<Flight>({
    queryKey: ["flights", id, company],
    queryFn: () => fetchFlightsById(id, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}
