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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
