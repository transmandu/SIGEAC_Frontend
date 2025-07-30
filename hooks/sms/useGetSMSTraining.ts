import axiosInstance from "@/lib/axios";
import { SMSTraining } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSMSTraining = async (company?: string): Promise<SMSTraining[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/employee-training`);
  return data;
};

export const useGetSMSTraining = (company?: string) => {
  return useQuery<SMSTraining[]>({
    queryKey: ["sms-training"],
    queryFn: () => fetchSMSTraining(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
