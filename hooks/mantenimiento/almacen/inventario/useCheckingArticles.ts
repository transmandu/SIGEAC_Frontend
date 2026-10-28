import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CheckingArticle } from "@/types/inventory";
import type { InventoryCategory } from "./useWarehouseInventoryArticles";

/**
 * De dónde viene lo que ingeniería revisa: `checking` es lo registrado con la
 * opción de solicitar chequeo; `reception` es lo que almacén pidió chequear
 * estando el artículo ya en recepción; `all` trae ambas.
 */
export type CheckingScope = "checking" | "reception" | "all";

export interface CheckingFilters {
  scope: CheckingScope;
  /** Falso incluye lo que está en recepción aunque almacén no pidiera chequeo. */
  onlyRequested: boolean;
  category: InventoryCategory;
  search?: string;
  condition?: string;
  is_hazardous?: boolean;
}

/**
 * Cola de artículos con chequeo de ingeniería pendiente.
 */
export const useCheckingArticles = (
  filters: CheckingFilters,
  enabled = true,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  const { onlyRequested, ...rest } = filters;

  return useCursorListing<CheckingArticle>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "checking",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/engineering/checking-articles`,
    params: {
      ...rest,
      only_requested: onlyRequested ? undefined : 0,
      is_hazardous: filters.is_hazardous ? 1 : undefined,
    },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    initialPageSize: 25,
  });
};
