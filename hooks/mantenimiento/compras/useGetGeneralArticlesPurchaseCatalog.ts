import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { GeneralArticlePurchaseCatalogItem } from "@/types/inventory";
import { useQuery } from "@tanstack/react-query";

/**
 * Catálogo de generales con el último costo registrado, para sugerir precio
 * al cotizar. Vive en compras: el catálogo de los demás formularios no lleva
 * costo.
 */
export const useGetGeneralArticlesPurchaseCatalog = (
  enabled: boolean = true,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<GeneralArticlePurchaseCatalogItem[], Error>({
    queryKey: [
      "general-articles",
      selectedCompany?.slug,
      selectedStation,
      "purchase-catalog",
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/purchase/general-articles/catalog`,
      );
      return data;
    },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    staleTime: 60_000,
  });
};
