import axiosInstance from "@/lib/axios";
import { Pilot } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchPilots = async (company?: string): Promise<Pilot[]> => {
  const { data } = await axiosInstance.get(`/${company}/pilots`);
  return data;
};

export const useGetPilots = (company?: string) => {
  return useQuery<Pilot[]>({
    queryKey: ["pilots"],
    queryFn: () => fetchPilots(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
