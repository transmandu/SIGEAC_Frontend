import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Workshop } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkshops = (companySlug?: string) => {
  const { selectedCompany } = useCompanyStore();
  const slug = companySlug ?? selectedCompany?.slug;

  return useQuery<Workshop[]>({
    queryKey: ["workshops", slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${slug}/workshops`);
      return data.data ?? data;
    },
    enabled: !!slug,
  });
};
