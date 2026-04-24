import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useAuth } from "@/contexts/AuthContext"

const fetchMyEmployee = async (company: string) => {
  const { data } = await axios.get("/me/employee", {
    params: { company },
  })

  return data.employee
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