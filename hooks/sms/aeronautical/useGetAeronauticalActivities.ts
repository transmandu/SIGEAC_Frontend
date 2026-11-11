import axiosInstance from "@/lib/axios";
import type { AeronauticalActivity } from "@/types/sms/aeronautical/activity";
import { useQuery } from "@tanstack/react-query";

const fetchAeronauticalActivities = async (
  company?: string,
): Promise<AeronauticalActivity[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/aeronautical/activities`,
  );
  return data;
};

export const useGetAeronauticalActivities = (company?: string) => {
  return useQuery<AeronauticalActivity[]>({
    queryKey: ["aeronautical-activities", company],
    queryFn: () => fetchAeronauticalActivities(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
