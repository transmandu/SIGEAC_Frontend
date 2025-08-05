import type { Credit } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

// Definir la estructura de datos que devuelve el endpoint
export interface FlightCreditsResponse {
  credits: Credit[]
  pending_credits: Credit[]
  payed_credits: Credit[]
  credits_payed_amount: number
  credits_debt_amount: number
  credits_total_amount: number
}

const fetchCreditStatisticsFlights = async (company?: string): Promise<FlightCreditsResponse[]> => {
  const { data } = await axiosInstance.get(`/${company}/credits-statistics-flights`)
  return data
}

export const useGetCreditStatisticsFlights = (company?: string) => {
  return useQuery<FlightCreditsResponse[]>({
    queryKey: ["credits-statistics-flights"],
    queryFn: () => fetchCreditStatisticsFlights(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company // Solo ejecuta la consulta si hay una empresa
  })
}
