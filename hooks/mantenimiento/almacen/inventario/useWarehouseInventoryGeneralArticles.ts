import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { WarehouseInventoryGeneralArticle } from "@/types/inventory";

export interface WarehouseGeneralFilters {
  search?: string;
  description_col?: string;
  brand_model_col?: string;
  variant_type_col?: string;
  unit?: string;
  quantity?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

/**
 * Inventario de generales del almacén, paginado por cursor. Sin costo: el
 * costo solo viaja en la gestión de costos.
 */
export const useWarehouseInventoryGeneralArticles = (
  filters: WarehouseGeneralFilters,
  enabled: boolean = true,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<WarehouseInventoryGeneralArticle>({
    queryKey: [
      "general-articles",
      selectedCompany?.slug,
      selectedStation,
      "warehouse-inventory",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/warehouse/inventory/general-articles`,
    params: { ...filters },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    initialPageSize: 25,
  });
};
