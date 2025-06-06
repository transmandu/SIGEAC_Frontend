import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSMSActivities = async (): Promise<SMSActivity[]> => {
  const { data } = await axiosInstance.get("/transmandu/sms/sms-activities");
  return data;
};

export const useGetSMSActivities = () => {
  return useQuery<SMSActivity[]>({
    queryKey: ["sms-activities"],
    queryFn: fetchSMSActivities,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
