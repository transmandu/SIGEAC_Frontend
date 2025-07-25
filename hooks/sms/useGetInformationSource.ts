import axiosInstance from "@/lib/axios";
import { InformationSource, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchInformationSources = async (
  company?: string
): Promise<InformationSource[]> => {
  const { data } = await axiosInstance.get(`/${company}/information-sources`);
  return data;
};

export const useGetInformationSources = (company?: string) => {
  return useQuery<InformationSource[]>({
    queryKey: ["information-sources"],
    queryFn: () => fetchInformationSources(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
