import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS } from "@/lib/fuel";
import { FuelSummary } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchFuelSummary = async (company: string): Promise<FuelSummary> => {
  const { data } = await axiosInstance.get(`/${company}/fuel/summary`);
  return {
    ...data,
    warehouse_balance_liters: Number(data?.warehouse_balance_liters ?? 0),
    vehicle_balance_liters: Number(data?.vehicle_balance_liters ?? 0),
    active_vehicle_count: Number(data?.active_vehicle_count ?? 0),
  };
};

export const useGetFuelSummary = (company?: string) => {
  return useQuery<FuelSummary>({
    queryKey: FUEL_QUERY_KEYS.summary(company),
    queryFn: () => fetchFuelSummary(company!),
    enabled: !!company,
  });
};
