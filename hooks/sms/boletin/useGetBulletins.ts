import axiosInstance from "@/lib/axios";
import { SafetyBulletin } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSafetyBulletins = async (company?: string): Promise<SafetyBulletin[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/bulletin`);
  return data;
};

export const useGetSafetyBulletins = (company?: string) => {
  return useQuery<SafetyBulletin[]>({
    queryKey: ["safety-bulletins", company],
    queryFn: () => fetchSafetyBulletins(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
