import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface AuthorizedEmployeeResponse {
  id: number;
  dni_employee: string;
  from_company_db: string;
  to_company_db: string;
  employee_name: string;
  job_title: string;
  department: string;
}

export const useGetAuthorizedEmployees = (companySlug?: string) => {
  return useQuery<AuthorizedEmployeeResponse[]>({
    queryKey: ["authorized-employees", companySlug],
    queryFn: async () => {
      if (!companySlug) return [];

      const { data } = await axios.get(
        `/${companySlug}/authorized-employees`
      );

      return data;
    },
    enabled: !!companySlug,
  });
};