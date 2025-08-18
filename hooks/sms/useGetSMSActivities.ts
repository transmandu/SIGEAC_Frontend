import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSMSActivities = async (company?: string): Promise<SMSActivity[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/activities`);
  return data;
};

export const useGetSMSActivities = (company?: string) => {
  return useQuery<SMSActivity[]>({
    queryKey: ["sms-activities"],
    queryFn: () => fetchSMSActivities(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
