"use client"

import type { Category } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchCategoryById = async (id: string, company?: string): Promise<Category> => {
  const { data } = await axiosInstance.get(`/${company}/accountants-categories/${id}`)
  return data
}

export const useGetCategoryById = (id: string, company?: string) => {
  return useQuery<Category>({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryById(id, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company, // Solo ejecuta la consulta si hay un ID
  })
}
