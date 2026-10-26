import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { CompanyScopeInfo } from "./types";

/** Alcances que esta empresa puede abrir a otras. */
export const useGetCompanyLoanScopes = (companySlug?: string) =>
  useQuery<CompanyScopeInfo[]>({
    queryKey: ["company-loan-scopes", companySlug],
    queryFn: async () => {
      const { data } = await axios.get(`/${companySlug}/company-loan-scopes`);
      return data;
    },
    enabled: !!companySlug,
    staleTime: 1000 * 60 * 30,
  });
