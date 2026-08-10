"use client"

import type { Accountant } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchAccountById = async (id: string, company?: string): Promise<Accountant> => {
  const { data } = await axiosInstance.get(`/${company}/accountants/${id}`)
  return data
}

export const useGetAccountById = (id: string, company?: string) => {
  return useQuery<Accountant>({
    queryKey: ["account", id],
    queryFn: () => fetchAccountById(id, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!company,
  })
}
