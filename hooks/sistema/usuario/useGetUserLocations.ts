import axiosInstance from "@/lib/axios";
import {
  readSessionSnapshot,
  writeSessionSnapshot,
} from "@/lib/session-snapshot";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface UserLocation {
  id: number;
  address: string;
  name?: string | null;
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
  const query = useQuery<UserLocation[]>({
    queryKey: ["user-locations", company],
    queryFn: () => fetchUserLocations(company!),
    // Lo de la última vez se muestra al instante; initialDataUpdatedAt: 0 lo
    // da por vencido, así que igual se vuelve a pedir y lo real lo reemplaza.
    initialData: () =>
      company ? readSessionSnapshot().locations[company] : undefined,
    initialDataUpdatedAt: 0,
    enabled: !!company,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Se guarda desde aquí y no dentro de queryFn: al cerrar sesión se descartan
  // las consultas, pero una petición en vuelo seguiría y escribiría las
  // estaciones del usuario que sale cuando ya se borró lo suyo. dataUpdatedAt
  // en 0 es el dato sembrado desde lo guardado, que no hay que reescribir.
  const { data, dataUpdatedAt } = query;

  useEffect(() => {
    if (company && data && dataUpdatedAt > 0) {
      writeSessionSnapshot({ locationsOf: { company, locations: data } });
    }
  }, [company, data, dataUpdatedAt]);

  return query;
};
