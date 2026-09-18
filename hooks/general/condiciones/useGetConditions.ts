import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Condition } from "@/types";
import { useQuery } from "@tanstack/react-query";

/** Condición de aeronavegabilidad del artículo (NEW, USED, OVERHAUL, etc). */
export const useGetConditions = (companySlug?: string) => {
  const { selectedCompany } = useCompanyStore();
  const slug = companySlug ?? selectedCompany?.slug;

  return useQuery<Condition[]>({
    queryKey: ["conditions", slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${slug}/condition-article`);
      return data;
    },
    enabled: !!slug,
  });
};
