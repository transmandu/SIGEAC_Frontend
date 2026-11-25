import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";
import type { CriticalAlertAudienceRule } from "@/types/critical-alerts";

export const CRITICAL_ALERT_AUDIENCE_KEY = "critical-alert-audience";

export const useGetCriticalAlertAudience = (company?: string) =>
  useQuery<CriticalAlertAudienceRule[], Error>({
    queryKey: [CRITICAL_ALERT_AUDIENCE_KEY, company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/critical-alert-audience`);
      return data.rules;
    },
    enabled: !!company,
  });
