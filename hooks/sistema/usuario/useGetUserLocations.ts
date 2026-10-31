import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface UserLocation {
  id: number;
  address: string;
  type: string;
  cod_iata: string;
  isMainBase: boolean;
}

/**
 * Versión imperativa. Úsala solo cuando necesites esperar el resultado
 * dentro de un flujo secuencial (ej. CompanyBootstrap).
 */
export const fetchUserLocations = async (
  company: string,
): Promise<UserLocation[]> => {
  const { data } = await axiosInstance.get(`/${company}/user-locations`);
  return data;
};

/**
 * Versión cacheada, para UI que solo necesita mostrar las estaciones.
 * Evita refetchear en cada render/navegación.
 */
export const useGetUserLocations = (company?: string) => {
  return useQuery<UserLocation[]>({
    queryKey: ["user-locations", company],
    queryFn: () => fetchUserLocations(company!),
    enabled: !!company,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
