import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CheckingArticle } from "@/types/inventory";
import type { InventoryCategory } from "./useWarehouseInventoryArticles";

export interface CheckingFilters {
  category: InventoryCategory;
  search?: string;
  condition?: string;
  is_hazardous?: boolean;
}

/**
 * Cola de artículos en revisión (CHECKING) que confirma ingeniería.
 */
export const useCheckingArticles = (filters: CheckingFilters) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<CheckingArticle>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "checking",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/engineering/checking-articles`,
    params: {
      ...filters,
      is_hazardous: filters.is_hazardous ? 1 : undefined,
    },
    enabled: !!selectedCompany && !!selectedStation,
    initialPageSize: 25,
  });
};
