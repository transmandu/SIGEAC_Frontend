import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelMovement } from "@/lib/fuel";
import { FuelMovement, FuelMovementType } from "@/types";
import { useQuery } from "@tanstack/react-query";

export type FuelMovementFilters = {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
  third_party_id?: string;
  type?: FuelMovementType | "all";
};

const fetchFuelMovements = async (
  company: string,
  filters: FuelMovementFilters,
): Promise<FuelMovement[]> => {
  const params = {
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    vehicle_id: filters.vehicle_id || undefined,
    third_party_id: filters.third_party_id || undefined,
    type: filters.type && filters.type !== "all" ? filters.type : undefined,
  };
  const { data } = await axiosInstance.get(`/${company}/fuel/movements`, {
    params,
  });
  return Array.isArray(data) ? data.map(normalizeFuelMovement) : [];
};

export const useGetFuelMovements = (
  company?: string,
  filters: FuelMovementFilters = {},
) => {
  return useQuery<FuelMovement[]>({
    queryKey: FUEL_QUERY_KEYS.movements(company, filters),
    queryFn: () => fetchFuelMovements(company!, filters),
    enabled: !!company,
  });
};
