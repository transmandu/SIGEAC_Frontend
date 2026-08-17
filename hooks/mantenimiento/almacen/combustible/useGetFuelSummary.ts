import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelSummary } from "@/lib/fuel";
import { FuelSummary } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchFuelSummary = async (company: string): Promise<FuelSummary> => {
  const { data } = await axiosInstance.get(`/${company}/fuel/summary`);
  return normalizeFuelSummary(data);
};

export const useGetFuelSummary = (company?: string) => {
  return useQuery<FuelSummary>({
    queryKey: FUEL_QUERY_KEYS.summary(company),
    queryFn: () => fetchFuelSummary(company!),
    enabled: !!company,
  });
};
