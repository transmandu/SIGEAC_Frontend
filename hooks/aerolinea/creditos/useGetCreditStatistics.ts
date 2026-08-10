import type { Credit } from "@/types"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

export interface RentingCreditsResponse {
  credits: Credit[]
  pending_credits: Credit[]
  payed_credits: Credit[]
  credits_payed_amount: number
  credits_debt_amount: number
  credits_total_amount: number
}

const fetchCreditStatistics = async (company?: string): Promise<RentingCreditsResponse> => {
  const { data } = await axiosInstance.get(`/${company}/credits-statistics-vendors`)
  return data
}

export const useGetCreditStatistics = (company?: string) => {
  return useQuery<RentingCreditsResponse>({
    queryKey: ["credits-statistics-rentings"],
    queryFn: () => fetchCreditStatistics(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company
  })
}
