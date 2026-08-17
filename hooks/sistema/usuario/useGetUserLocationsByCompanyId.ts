import axiosInstance from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

interface locationsByCompanyId {
  id: number;
  address: string;
  type: string;
  cod_iata: string;
  isMainBase: boolean;
}
[];

const fetchUserLocationsByCompanyId = async (
  company_id: number
): Promise<locationsByCompanyId[]> => {
  const response = await axiosInstance.post(`/user-locations-by-company-id`, {
    company_id,
  });
  return response.data;
};

export const userLocationsQueryKey = (company_id?: number) => [
  "user-locations-by-company-id",
  company_id,
];

/**
 * Versión imperativa. Úsala solo cuando necesites esperar el resultado
 * dentro de un flujo secuencial (ej. CompanyBootstrap).
 */
export const useGetUserLocationsByCompanyId = () => {
  return useMutation<locationsByCompanyId[], Error, number>({
    mutationFn: fetchUserLocationsByCompanyId,
  });
};

/**
 * Versión cacheada, para UI que solo necesita mostrar las estaciones.
 * Evita refetchear en cada render/navegación.
 */
export const useUserLocationsByCompanyId = (company_id?: number) => {
  return useQuery<locationsByCompanyId[]>({
    queryKey: userLocationsQueryKey(company_id),
    queryFn: () => fetchUserLocationsByCompanyId(company_id!),
    enabled: !!company_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
