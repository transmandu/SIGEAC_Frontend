import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface ActivityStatsResponse {
  statusData: { name: string; value: number }[];
  typeData: { name: string; value: number }[];
  responsibleData: { name: string; value: number }[];
}

export const useGetSMSActivityStats = (
  from: string,
  to: string,
  stationId: number | string | null,
  companySlug?: string,
) => {
  return useQuery<ActivityStatsResponse>({
    queryKey: ["sms-activity-stats", companySlug, stationId, from, to],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${companySlug}/sms/activities-stats`,
        {
          params: {
            from: from,
            to: to,
          },
        },
      );

      return data;
    },
    enabled: !!companySlug && !!from && !!to,
    refetchOnWindowFocus: false,
  });
};
