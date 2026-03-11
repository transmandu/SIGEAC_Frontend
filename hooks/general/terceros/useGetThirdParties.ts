import axiosInstance from "@/lib/axios";
import { Vendor } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchThirdParties = async (company?: string): Promise<Vendor[]> => {
  if (!company) return [];

  const { data } = await axiosInstance.get(`/${company}/vendors`);
  return data;
};

export const useGetThirdParties = (company?: string) => {
  return useQuery<Vendor[]>({
    queryKey: ["third-parties", company],
    queryFn: () => fetchThirdParties(company),
    enabled: !!company,
  });
};
