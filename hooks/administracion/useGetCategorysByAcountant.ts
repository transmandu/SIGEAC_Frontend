"use client"

import type { Category } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCategorysByAcountant = async (id: string): Promise<Category[]> => { 
  const { data } = await axiosInstance.get(`/transmandu/categorys-by-accountant/${id}`)
  return data
}

export const useGetCategorysByAccountant = (id: string) => {
  return useQuery<Category[]>({ 
    queryKey: ["categorys-accountant", id],
    queryFn: () => fetchCategorysByAcountant(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}