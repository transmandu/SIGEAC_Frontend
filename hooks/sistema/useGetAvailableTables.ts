import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

/**
 * Tablas migradas en la base de la compañía. El menú oculta las opciones cuyas
 * tablas no existen: no todas las compañías corren todos los módulos.
 */
export const useGetAvailableTables = (company?: string) => {
  return useQuery<string[]>({
    queryKey: ["available-tables", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/available-tables`);
      return data;
    },
    enabled: !!company,
    // El menú espera esta respuesta para pintarse; con los tres reintentos por
    // defecto un fallo lo dejaría en el marcador varios segundos.
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
