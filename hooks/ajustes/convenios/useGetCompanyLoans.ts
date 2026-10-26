import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { CompanyLoansResponse } from "./types";

/** Convenios de la empresa: los que otorga y los que recibe. */
export const useGetCompanyLoans = (companySlug?: string) =>
  useQuery<CompanyLoansResponse>({
    queryKey: ["company-loans", companySlug],
    queryFn: async () => {
      const { data } = await axios.get(`/${companySlug}/company-loans`);
      return data;
    },
    enabled: !!companySlug,
  });
