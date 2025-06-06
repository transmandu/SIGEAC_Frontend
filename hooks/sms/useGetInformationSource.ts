import axiosInstance from "@/lib/axios";
import { InformationSource, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchInformationSources = async (): Promise<InformationSource[]> => {
  const { data } = await axiosInstance.get("/transmandu/information-sources");
  return data;
};

export const useGetInformationSources = () => {
  return useQuery<InformationSource[]>({
    queryKey: ["information-sources"],
    queryFn: fetchInformationSources,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
