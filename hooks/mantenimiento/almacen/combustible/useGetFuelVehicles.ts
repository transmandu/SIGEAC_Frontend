import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelVehicle } from "@/lib/fuel";
import { FuelVehicle } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchFuelVehicles = async (company: string): Promise<FuelVehicle[]> => {
  const { data } = await axiosInstance.get(`/${company}/fuel/vehicles`);
  return Array.isArray(data) ? data.map(normalizeFuelVehicle) : [];
};

export const useGetFuelVehicles = (company?: string) => {
  return useQuery<FuelVehicle[]>({
    queryKey: FUEL_QUERY_KEYS.vehicles(company),
    queryFn: () => fetchFuelVehicles(company!),
    enabled: !!company,
  });
};
