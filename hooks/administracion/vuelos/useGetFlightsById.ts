"use client"

import type { Flight } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchFlightsById = async (id: string): Promise<Flight> => {
  const { data } = await axiosInstance.get(`/transmandu/flights/${id}`)
  return data
}

export const useGetFlightById = (id: string) => {
  return useQuery<Flight>({
    queryKey: ["flights", id],
    queryFn: () => fetchFlightsById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}