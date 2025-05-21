import type { Credit } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

// Definir la estructura de datos que devuelve el endpoint
export interface RentingCreditsResponse {
  credits: Credit[]
  pending_credits: Credit[]
  payed_credits: Credit[]
  credits_payed_amount: number
  credits_debt_amount: number
  credits_total_amount: number
}

const fetchCreditStatisticsRenting = async (): Promise<RentingCreditsResponse> => {
  const { data } = await axiosInstance.get("/transmandu/credits-statistics-rentings")
  return data
}

export const useGetCreditStatisticsRentings = () => {
  return useQuery<RentingCreditsResponse>({
    queryKey: ["credits-statistics-rentings"],
    queryFn: fetchCreditStatisticsRenting,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}