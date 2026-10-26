import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { LoanHistoryEvent } from "./types";

/** Todo lo ocurrido en un convenio, de lo más reciente a lo más antiguo. */
export const useGetLoanHistory = (
  companySlug: string | undefined,
  agreementId: number | undefined,
) =>
  useQuery<LoanHistoryEvent[]>({
    queryKey: ["company-loan-history", companySlug, agreementId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${companySlug}/company-loans/${agreementId}/history`,
      );
      return data;
    },
    enabled: !!companySlug && !!agreementId,
  });
