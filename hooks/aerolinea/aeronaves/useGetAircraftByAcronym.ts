"use client"

import type { Aircraft } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

const fetchAircraftByAcronym = async (acronym: string, company?: string): Promise<Aircraft> => {
  const { data } = await axiosInstance.get(`/${company}/aircrafts/${acronym}`)
  return data
}

export const useGetAircraftByAcronym = (acronym: string, company?: string) => {
  return useQuery<Aircraft>({
    queryKey: ["aircrafts", acronym],
    queryFn: () => fetchAircraftByAcronym(acronym),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!acronym && !!company,
  })
}
