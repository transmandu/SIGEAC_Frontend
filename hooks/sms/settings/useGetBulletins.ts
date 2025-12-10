import axiosInstance from "@/lib/axios";
import { Bulletin } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBulletins = async (company?: string): Promise<Bulletin[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/bulletin`);
  return data;
};

export const useGetBulletins = (company?: string) => {
  return useQuery<Bulletin[]>({
    queryKey: ["bulletins", company],
    queryFn: () => fetchBulletins(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
