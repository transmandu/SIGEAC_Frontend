"use client"

import type { AdministrationArticle } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchAdministrationArticleById = async (id: string): Promise<AdministrationArticle> => {
  const { data } = await axiosInstance.get(`/transmandu/articles/${id}`)
  return data
}

export const useGetAdministrationArticleById = (id: string) => {
  return useQuery<AdministrationArticle>({
    queryKey: ["article", id],
    queryFn: () => fetchAdministrationArticleById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}