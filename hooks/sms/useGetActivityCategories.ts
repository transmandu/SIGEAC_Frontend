import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ActivityCategory } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchActivityCategories = async (
  company?: string
): Promise<ActivityCategory[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/activity-categories`);
  return data;
};

export const useGetActivityCategories = () => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<ActivityCategory[]>({
    queryKey: ["sms-activity-categories", selectedCompany?.slug],
    queryFn: () => fetchActivityCategories(selectedCompany?.slug),
    enabled: !!selectedCompany?.slug,
    staleTime: 1000 * 60 * 5,
  });
};
