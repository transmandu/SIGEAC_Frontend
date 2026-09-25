import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { WarehouseInventoryArticle } from "@/types/inventory";

export type InventoryCategory =
  "all" | "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL";

export interface WarehouseInventoryFilters {
  category: InventoryCategory;
  search?: string;
  status?: string;
  tool_status?: string;
  condition?: string;
  is_hazardous?: boolean;
  zone?: string;
  part_number_col?: string;
  serial_col?: string;
  description_col?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

/**
 * Inventario aeronáutico del almacén, paginado por cursor.
 *
 * Cuando el orden agrupa (número de parte o descripción) el servidor devuelve
 * grupos completos: `per_page` y `total` cuentan grupos, y las filas de un
 * mismo grupo llegan juntas con su `group_key`.
 */
export const useWarehouseInventoryArticles = (
  filters: WarehouseInventoryFilters,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<WarehouseInventoryArticle>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "warehouse-inventory",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/warehouse/inventory/articles`,
    params: {
      ...filters,
      is_hazardous: filters.is_hazardous ? 1 : undefined,
    },
    enabled: !!selectedCompany && !!selectedStation,
  });
};
