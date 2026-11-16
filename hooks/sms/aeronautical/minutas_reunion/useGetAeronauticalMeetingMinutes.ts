import axiosInstance from "@/lib/axios";
import type { AeronauticalMeetingMinute } from "@/types/sms/aeronautical/meeting-minute";
import { useQuery } from "@tanstack/react-query";

const fetchMeetingMinutes = async (
  location?: string,
  company?: string,
): Promise<AeronauticalMeetingMinute[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/aeronautical/${location}/meeting-minutes`,
  );
  return data;
};

export const useGetAeronauticalMeetingMinutes = (
  location: string,
  company?: string,
) => {
  return useQuery<AeronauticalMeetingMinute[]>({
    queryKey: ["aeronautical-meeting-minutes", location, company],
    queryFn: () => fetchMeetingMinutes(location, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!location,
  });
};
