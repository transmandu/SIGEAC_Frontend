"use client"

import type { Category } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCategoriesByAcountant = async (id: string): Promise<Category[]> => { 
  const { data } = await axiosInstance.get(`/transmandu/categories-by-accountant/${id}`)
  return data
}

export const useGetCategoriesByAccountant = (id: string) => {
  return useQuery<Category[]>({ 
    queryKey: ["categories-accountant", id],
    queryFn: () => fetchCategoriesByAcountant(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}