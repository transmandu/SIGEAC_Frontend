import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useAuth } from "@/contexts/AuthContext"

const fetchMyEmployee = async (company: string) => {
  try {
    const { data } = await axios.get("/me/employee", {
      params: { company },
    })

    return data.employee
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null
    }
    throw error
  }
}

export const useMyEmployee = () => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const companySlug = selectedCompany?.slug

  return useQuery({
    queryKey: ["me-employee", companySlug, user?.id],

    enabled: !!user?.id && !!companySlug,

    queryFn: () => fetchMyEmployee(companySlug!),

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,

    retry: false,
  })
}