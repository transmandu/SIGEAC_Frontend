import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/**
 * Hook para obtener empleados autorizados **por mi empresa a otras empresas**
 * @param companySlug slug de la empresa que autoriza empleados (from_company_db)
 */

export interface AuthorizedEmployeeResponse {
  id: number;
  dni_employee: string;
  from_company_db: string;
  to_company_db: string;
  employee_name: string;
  job_title: string;
  department: string;
}

export const useGetAuthorizedEmployeesFromCompany = (companySlug?: string) => {
  return useQuery<AuthorizedEmployeeResponse[]>({
    queryKey: ["authorized-employees-from-company", companySlug],
    queryFn: async () => {
      if (!companySlug) return [];

      const { data } = await axios.get(
        `/${companySlug}/authorized-employees/from-company`
      );

      return data;
    },
    enabled: !!companySlug,
  });
};