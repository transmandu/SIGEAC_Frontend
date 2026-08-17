import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ThirdParty } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetThirdParties = (companySlug?: string) => {
  const { selectedCompany } = useCompanyStore();
  const slug = companySlug ?? selectedCompany?.slug;

  return useQuery<ThirdParty[]>({
    queryKey: ["third-parties", slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${slug}/third-parties`);
      return data;
    },
    enabled: !!slug,
  });
};
