import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CompanyInventoryArticle, CursorPage } from "@/types/inventory";
import { useQuery } from "@tanstack/react-query";
import type { CompanyInventoryFilters } from "./useCompanyInventoryArticles";

const PAGE_SIZE = 100;

/**
 * Unidades de un número de parte en el inventario de consulta de la compañía,
 * bajo los mismos filtros de la tabla: así el detalle coincide con el conteo
 * de la fila agrupada. Trae una sola página; `total` permite avisar si hay más.
 */
export const useCompanyPartNumberArticles = (
  partNumber: string,
  filters: CompanyInventoryFilters,
  enabled: boolean,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<{ rows: CompanyInventoryArticle[]; total: number }>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "company-inventory-part-number",
      partNumber,
      filters,
    ],
    queryFn: async () => {
      const { data } = await axios.get<CursorPage<CompanyInventoryArticle>>(
        `/${selectedCompany?.slug}/${selectedStation}/inventory/articles`,
        {
          params: {
            ...filters,
            is_hazardous: filters.is_hazardous ? 1 : undefined,
            part_number: partNumber,
            per_page: PAGE_SIZE,
          },
        },
      );
      return { rows: data.data, total: data.total ?? data.data.length };
    },
    enabled: enabled && !!partNumber && !!selectedCompany && !!selectedStation,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
