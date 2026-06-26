import axiosInstance from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

type ActiveCompanyLogo = {
  company_id: number
  slug: string
  logo: string | null
}

const fetchActiveCompanyLogo = async (
  company: string
): Promise<ActiveCompanyLogo> => {
  const { data } = await axiosInstance.get(`/${company}/logo`)
  return data.data
}

export const useGetActiveCompanyLogo = (company?: string) => {
  return useQuery({
    queryKey: ['active-company-logo', company],
    queryFn: () => fetchActiveCompanyLogo(company as string),
    enabled: !!company,
    staleTime: 1000 * 60 * 5,
  })
}
