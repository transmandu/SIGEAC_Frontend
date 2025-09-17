import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { InformationSource } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchInformationSources = async (
  company?: string
): Promise<InformationSource[]> => {
  const { data } = await axiosInstance.get(`/${company}/information-sources`);
  return data;
};

export const useGetInformationSources = () => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<InformationSource[]>({
    queryKey: ["information-sources"],
    queryFn: () => fetchInformationSources(selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug,
  });
};
