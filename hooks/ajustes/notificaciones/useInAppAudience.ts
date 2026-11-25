import { useQuery } from "@tanstack/react-query";

import axios from "@/lib/axios";
import type { InAppAudienceResponse } from "@/types/in-app-notices";

export const IN_APP_AUDIENCE_KEY = "in-app-audience";

export const useGetInAppAudience = (company?: string) =>
  useQuery<InAppAudienceResponse, Error>({
    queryKey: [IN_APP_AUDIENCE_KEY, company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/notification-audience`);
      return data;
    },
    enabled: !!company,
  });
