import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { StockAdjustmentBatch } from "@/types/inventory";

export interface StockAdjustmentFilters {
  category?: "all" | "CONSUMABLE" | "COMPONENT";
  search?: string;
  zone?: string;
}

/**
 * Consumibles y componentes agrupados por renglón, para ajustar cantidades y
 * ubicaciones. El cursor avanza por renglones completos.
 */
export const useStockAdjustmentArticles = (filters: StockAdjustmentFilters) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<StockAdjustmentBatch>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "stock-adjustment",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/warehouse/stock-adjustment/articles`,
    params: { ...filters },
    enabled: !!selectedCompany && !!selectedStation,
    initialPageSize: 15,
  });
};
