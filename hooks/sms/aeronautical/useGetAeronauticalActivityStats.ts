import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface AeronauticalActivityStatsResponse {
  statusData: { name: string; value: number }[];
  typeData: { name: string; value: number }[];
}

const fetchAeronauticalActivityStats = async (
  company?: string,
): Promise<AeronauticalActivityStatsResponse> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/aeronautical/activities-stats`,
  );
  return data;
};

export const useGetAeronauticalActivityStats = (company?: string) => {
  return useQuery<AeronauticalActivityStatsResponse>({
    queryKey: ["aeronautical-activity-stats", company],
    queryFn: () => fetchAeronauticalActivityStats(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
