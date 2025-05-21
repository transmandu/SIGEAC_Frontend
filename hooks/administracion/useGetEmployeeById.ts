"use client"

import type { Employee } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchEmployeeById = async (id: string): Promise<Employee> => {
  const { data } = await axiosInstance.get(`/transmandu/employees/${id}`)
  return data
}

export const useGetEmployeeById = (id: string) => {
  return useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  })
}