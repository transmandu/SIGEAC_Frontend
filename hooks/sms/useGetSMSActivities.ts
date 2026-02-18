import axiosInstance from "@/lib/axios";
import { SMSActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";

// 1. Agregamos los parámetros a la función de fetch
const fetchSMSActivities = async (
  company?: string, 
  from?: string, 
  to?: string
): Promise<SMSActivity[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/activities`, {
    params: { from, to }, // Axios limpia automáticamente los undefined
  });
  return data;
};

export const useGetSMSActivities = (company?: string, from?: string, to?: string) => {
  return useQuery<SMSActivity[]>({
    // 2. IMPORTANTE: La queryKey ahora es dinámica. 
    // Si 'from' o 'to' cambian, React Query dispara un nuevo fetch.
    queryKey: ["sms-activities", company, from, to], 
    queryFn: () => fetchSMSActivities(company, from, to),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};