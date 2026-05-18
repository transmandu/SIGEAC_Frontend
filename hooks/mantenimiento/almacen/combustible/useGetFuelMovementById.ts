import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelMovement } from "@/lib/fuel";
import { FuelMovement } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchFuelMovementById = async (
  company: string,
  id: number,
): Promise<FuelMovement> => {
  const { data } = await axiosInstance.get(`/${company}/fuel/movements/${id}`);
  return normalizeFuelMovement(data);
};

export const useGetFuelMovementById = (company?: string, id?: number | null) => {
  return useQuery<FuelMovement>({
    queryKey: FUEL_QUERY_KEYS.movement(company, id),
    queryFn: () => fetchFuelMovementById(company!, id!),
    enabled: !!company && !!id,
  });
};
