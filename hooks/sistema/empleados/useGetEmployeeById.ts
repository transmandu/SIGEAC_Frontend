"use client"

import axiosInstance from "@/lib/axios"
import type { Employee } from "@/types"
import { useQuery } from "@tanstack/react-query"

const fetchEmployeeById = async (id: string, company?: string): Promise<Employee> => {
  const { data } = await axiosInstance.get(`/${company}/employees/${id}`)
  return data
}

export const useGetEmployeeById = (id: string, company?: string) => {
  return useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company, // Solo ejecuta la consulta si hay un ID
  })
}
