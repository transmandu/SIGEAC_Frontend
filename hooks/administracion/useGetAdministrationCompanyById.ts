"use client"

import type { AdministrationCompany } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchAdministrationCompanyById = async (id: string): Promise<AdministrationCompany> => {
  const { data } = await axiosInstance.get(`/transmandu/administration-company/${id}`)
  return data
}

export const useGetAdministrationCompanyById = (id: string) => {
  return useQuery<AdministrationCompany>({
    queryKey: ["admin-companies", id],
    queryFn: () => fetchAdministrationCompanyById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}