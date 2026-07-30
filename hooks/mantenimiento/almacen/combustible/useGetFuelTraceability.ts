import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelTraceability } from "@/lib/fuel";
import { FuelTraceabilityDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_PER_PAGE = 15;

const fetchFuelTraceability = async (
  company: string,
  movementId: number,
  page: number,
  perPage: number,
): Promise<FuelTraceabilityDetail> => {
  const { data } = await axiosInstance.get(
    `/${company}/fuel/movements/${movementId}/traceability`,
    { params: { page, per_page: perPage } },
  );
  return normalizeFuelTraceability(data);
};

export const useGetFuelTraceability = (
  company?: string,
  movementId?: number | null,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE,
) => {
  return useQuery<FuelTraceabilityDetail>({
    queryKey: FUEL_QUERY_KEYS.traceability(company, movementId, page, perPage),
    queryFn: () => fetchFuelTraceability(company!, movementId!, page, perPage),
    enabled: !!company && !!movementId,
  });
};
