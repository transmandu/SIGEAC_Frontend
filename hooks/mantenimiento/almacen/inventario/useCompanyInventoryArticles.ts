import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CompanyInventoryArticle } from "@/types/inventory";
import type { InventoryCategory } from "./useWarehouseInventoryArticles";

export interface CompanyInventoryFilters {
  category: InventoryCategory;
  search?: string;
  condition?: string;
  is_hazardous?: boolean;
}

/**
 * Inventario de consulta de la compañía: qué hay y cuánto hay disponible.
 * Componentes y partes llegan resumidos por número de parte.
 */
export const useCompanyInventoryArticles = (
  filters: CompanyInventoryFilters,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<CompanyInventoryArticle>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "company-inventory",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/inventory/articles`,
    params: {
      ...filters,
      is_hazardous: filters.is_hazardous ? 1 : undefined,
    },
    enabled: !!selectedCompany && !!selectedStation,
  });
};
