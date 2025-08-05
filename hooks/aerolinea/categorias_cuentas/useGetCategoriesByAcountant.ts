"use client"

import type { Category } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCategoriesByAcountant = async (id: string, company?: string): Promise<Category[]> => {
  const { data } = await axiosInstance.get(`/${company}/categories-by-accountant/${id}`)
  return data
}

export const useGetCategoriesByAccountant = (id: string, company?: string) => {
  return useQuery<Category[]>({
    queryKey: ["categories-accountant", id, company],
    queryFn: () => fetchCategoriesByAcountant(id, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company, // Solo ejecuta la consulta si hay un ID
  })
}
