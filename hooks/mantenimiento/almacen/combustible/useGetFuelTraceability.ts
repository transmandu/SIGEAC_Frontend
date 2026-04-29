import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelTraceability } from "@/lib/fuel";
import { FuelTraceabilityDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchFuelTraceability = async (
  company: string,
  movementId: number,
): Promise<FuelTraceabilityDetail> => {
  const { data } = await axiosInstance.get(
    `/${company}/fuel/movements/${movementId}/traceability`,
  );
  return normalizeFuelTraceability(data);
};

export const useGetFuelTraceability = (
  company?: string,
  movementId?: number | null,
) => {
  return useQuery<FuelTraceabilityDetail>({
    queryKey: FUEL_QUERY_KEYS.traceability(company, movementId),
    queryFn: () => fetchFuelTraceability(company!, movementId!),
    enabled: !!company && !!movementId,
  });
};
