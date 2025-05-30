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

const fetchCreditStatisticsFlights = async (): Promise<FlightCreditsResponse[]> => {
  const { data } = await axiosInstance.get("/transmandu/credits-statistics-flights")
  return data
}

export const useGetCreditStatisticsFlights = () => {
  return useQuery<FlightCreditsResponse[]>({
    queryKey: ["credits-statistics-flights"],
    queryFn: fetchCreditStatisticsFlights,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
