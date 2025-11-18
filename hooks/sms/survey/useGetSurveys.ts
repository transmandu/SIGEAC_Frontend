import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Survey } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSurveys = async (
  company?: string,
  location_id?: string
): Promise<Survey[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/sms/survey`
  );
  return data;
};

export const useGetSurveys = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<Survey[]>({
    queryKey: ["surveys", selectedCompany?.slug, selectedStation],
    queryFn: () => fetchSurveys(selectedCompany?.slug, selectedStation!),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug && !!selectedStation, 
  });
};
