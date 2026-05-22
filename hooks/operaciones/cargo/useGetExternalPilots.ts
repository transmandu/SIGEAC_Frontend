import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { ExternalPilot } from "@/types";

const fetchExternalPilots = async (
  company?: string,
): Promise<ExternalPilot[]> => {
  const { data } = await axiosInstance.get(`/${company}/external-pilots`);
  return data;
};

export const useGetExternalPilots = (company?: string) => {
  return useQuery<ExternalPilot[]>({
    queryKey: ["external-pilots"],
    queryFn: () => fetchExternalPilots(company),
    staleTime: 1000 * 6 * 5,
    enabled: !!company,
  });
};
