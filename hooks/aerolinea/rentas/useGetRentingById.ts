"use client"

import type { Renting } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchRentingById = async (id: string, company?: string): Promise<Renting> => {
  const { data } = await axiosInstance.patch(`/${company}/renting-define-end-date/${id}`)
  return data;
}

export const useGetRentingById = (id: string, company?: string) => {
  return useQuery<Renting>({
    queryKey: ["rent"],
    queryFn: () => fetchRentingById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company, // Solo ejecuta la consulta si hay un ID
  })
}
