import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { CompanyInventoryGeneralArticle } from "@/types/inventory";

/**
 * Consulta de generales de la compañía: existencia con su unidad, paginada
 * por cursor.
 */
export const useCompanyInventoryGeneralArticles = (
  search?: string,
  enabled: boolean = true,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<CompanyInventoryGeneralArticle>({
    queryKey: [
      "general-articles",
      selectedCompany?.slug,
      selectedStation,
      "company-inventory",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/inventory/general-articles`,
    params: { search },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    initialPageSize: 25,
  });
};
