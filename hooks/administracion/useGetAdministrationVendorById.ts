"use client"

import type { AdministrationVendor } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchAdministrationVendorById = async (id: string): Promise<AdministrationVendor> => {
  const { data } = await axiosInstance.get(`/transmandu/administration-vendors/${id}`)
  return data
}

export const useGetAdministrationVendorById = (id: string) => {
  return useQuery<AdministrationVendor>({
    queryKey: ["vendor", id],
    queryFn: () => fetchAdministrationVendorById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}
