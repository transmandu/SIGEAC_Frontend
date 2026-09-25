import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { GeneralArticleCatalogItem } from "@/types/inventory";
import { useQuery } from "@tanstack/react-query";

/**
 * Catálogo completo de artículos generales de la sede para los selectores de
 * los formularios (despacho, requisición, alta de artículo, reportes).
 *
 * No pagina: los selectores filtran mientras se escribe. Tampoco trae costo
 * ni historial de compras; lo que es un listado en pantalla usa los hooks de
 * inventario, paginados por cursor.
 */
export const useGetGeneralArticles = (enabled: boolean = true) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<GeneralArticleCatalogItem[], Error>({
    queryKey: [
      "general-articles",
      selectedCompany?.slug,
      selectedStation,
      "catalog",
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/general-articles/catalog`,
      );
      return data;
    },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    staleTime: 60_000,
  });
};
