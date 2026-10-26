import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { LoanPersonnel } from "./types";

/** Personal de la empresa receptora habilitado en un convenio que esta otorga. */
export const useGetLoanPersonnel = (
  companySlug: string | undefined,
  agreementId: number | undefined,
) =>
  useQuery<LoanPersonnel[]>({
    queryKey: ["company-loan-personnel", companySlug, agreementId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${companySlug}/company-loans/${agreementId}/personnel`,
      );
      return data;
    },
    enabled: !!companySlug && !!agreementId,
  });
