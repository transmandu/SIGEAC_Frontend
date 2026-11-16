import axiosInstance from "@/lib/axios";
import type { AeronauticalMeetingMinuteDetail } from "@/types/sms/aeronautical/meeting-minute";
import { useQuery } from "@tanstack/react-query";

const fetchMeetingMinuteByDepartment = async (
  id: string,
  location: string,
  company?: string,
): Promise<AeronauticalMeetingMinuteDetail> => {
  const { data } = await axiosInstance.get(
    `/${company}/aeronautical/${location}/meeting-minutes/${id}`,
  );
  return data;
};

export const useGetAeronauticalMeetingMinuteByDepartment = (
  id: string,
  location: string,
  company?: string,
) => {
  return useQuery<AeronauticalMeetingMinuteDetail>({
    queryKey: ["aeronautical-meeting-minute-department", id, location, company],
    queryFn: () => fetchMeetingMinuteByDepartment(id, location, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company && !!location && !!id,
  });
};
