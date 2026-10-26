import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { CompanyScope, LoanAudience } from "./types";

/** Quién de esta empresa puede usar un alcance de un convenio recibido. */
export const useGetLoanAudience = (
  companySlug: string | undefined,
  agreementId: number | undefined,
  scope: CompanyScope | undefined,
) =>
  useQuery<LoanAudience>({
    queryKey: ["company-loan-audience", companySlug, agreementId, scope],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${companySlug}/company-loans/received/${agreementId}/scopes/${scope}/audience`,
      );
      return data;
    },
    enabled: !!companySlug && !!agreementId && !!scope,
  });
