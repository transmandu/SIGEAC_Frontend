import axiosInstance from "@/lib/axios";
import { SafetyBulletin } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBulletins = async (company?: string): Promise<SafetyBulletin[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/bulletin`);
  return data;
};

export const useGetBulletins = (company?: string) => {
  return useQuery<SafetyBulletin[]>({
    queryKey: ["safety-bulletins", company],
    queryFn: () => fetchBulletins(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
