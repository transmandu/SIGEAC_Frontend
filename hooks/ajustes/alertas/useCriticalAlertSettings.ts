import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";
import type { CriticalAlertConfig } from "@/types/critical-alerts";

export const CRITICAL_ALERT_SETTINGS_KEY = "critical-alert-settings";

export const useGetCriticalAlertSettings = (company?: string) =>
  useQuery<CriticalAlertConfig[], Error>({
    queryKey: [CRITICAL_ALERT_SETTINGS_KEY, company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/critical-alert-settings`);
      return data.alerts;
    },
    enabled: !!company,
  });
