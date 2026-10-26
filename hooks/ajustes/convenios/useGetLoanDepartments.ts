import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { LoanDepartment } from "./types";

/** Departamentos de otra empresa con la que hay convenio. */
export const useGetLoanDepartments = (
  companySlug?: string,
  otherCompanySlug?: string,
) =>
  useQuery<LoanDepartment[]>({
    queryKey: ["company-loan-departments", companySlug, otherCompanySlug],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${companySlug}/company-loans/${otherCompanySlug}/departments`,
      );
      return data;
    },
    enabled: !!companySlug && !!otherCompanySlug,
  });
