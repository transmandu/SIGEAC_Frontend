"use client"

import type { Category } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCategoryById = async (id: string): Promise<Category> => {
  const { data } = await axiosInstance.get(`/transmandu/accountants-categories/${id}`)
  return data
}

export const useGetCategoryById = (id: string) => {
  return useQuery<Category>({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}