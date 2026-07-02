import axiosInstance from "@/lib/axios";
import { MeetingMinutes } from "@/types";
import { useQuery } from "@tanstack/react-query";


const fetchMeetingMinutes = async (
  location?: string,
  company?: string,
): Promise<MeetingMinutes[]> => {
  const { data } = await axiosInstance.get(`/${company}/${location}/meeting-minutes`);
  return data;
};

export const useGetMeetingMinutes = (location: string, company?: string) => {
  return useQuery<MeetingMinutes[]>({
    queryKey: ["meeting-minutes", location, company],
    queryFn: () => fetchMeetingMinutes(location, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!location,
  });
};
