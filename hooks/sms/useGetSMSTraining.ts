import axiosInstance from "@/lib/axios";
import { SMSActivity, SMSTraining } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSMSTraining = async (): Promise<SMSTraining[]> => {
  const { data } = await axiosInstance.get("/transmandu/sms/employee-training");
  return data;
};

export const useGetSMSTraining = () => {
  return useQuery<SMSTraining[]>({
    queryKey: ["sms-training"],
    queryFn: fetchSMSTraining,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
