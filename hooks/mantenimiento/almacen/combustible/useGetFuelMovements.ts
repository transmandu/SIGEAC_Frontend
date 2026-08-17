import axiosInstance from "@/lib/axios";
import { FUEL_QUERY_KEYS, normalizeFuelMovement } from "@/lib/fuel";
import { FuelMovement, FuelMovementType, FuelType } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type FuelMovementFilters = {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
  third_party_id?: string;
  type?: FuelMovementType | "all";
  fuel_type?: FuelType | "all";
  page?: number;
  per_page?: number;
};

export type FuelMovementsPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type FuelMovementsPage = {
  movements: FuelMovement[];
  pagination: FuelMovementsPagination;
};

const fetchFuelMovements = async (
  company: string,
  filters: FuelMovementFilters,
): Promise<FuelMovementsPage> => {
  const params = {
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    vehicle_id: filters.vehicle_id || undefined,
    third_party_id: filters.third_party_id || undefined,
    type: filters.type && filters.type !== "all" ? filters.type : undefined,
    fuel_type:
      filters.fuel_type && filters.fuel_type !== "all"
        ? filters.fuel_type
        : undefined,
    page: filters.page ?? 1,
    per_page: filters.per_page ?? 15,
  };
  const { data } = await axiosInstance.get(`/${company}/fuel/movements`, {
    params,
  });

  // El backend ahora pagina la respuesta (formato paginator de Laravel:
  // { data, current_page, last_page, per_page, total, from, to }).
  if (Array.isArray(data)) {
    return {
      movements: data.map(normalizeFuelMovement),
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        total: data.length,
        from: data.length ? 1 : null,
        to: data.length,
      },
    };
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  return {
    movements: rows.map(normalizeFuelMovement),
    pagination: {
      current_page: Number(data?.current_page ?? 1),
      last_page: Number(data?.last_page ?? 1),
      per_page: Number(data?.per_page ?? params.per_page),
      total: Number(data?.total ?? rows.length),
      from: data?.from ?? null,
      to: data?.to ?? null,
    },
  };
};

export const useGetFuelMovements = (
  company?: string,
  filters: FuelMovementFilters = {},
) => {
  return useQuery<FuelMovementsPage>({
    queryKey: FUEL_QUERY_KEYS.movements(company, filters),
    queryFn: () => fetchFuelMovements(company!, filters),
    enabled: !!company,
    // Mantiene la pagina anterior visible mientras carga la siguiente,
    // evitando el parpadeo de "sin movimientos" al paginar.
    placeholderData: keepPreviousData,
  });
};
