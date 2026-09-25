import { useCursorListing } from "@/hooks/helpers/useCursorListing";
import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { GeneralArticleCostHistoryEntry } from "@/types";
import type { ArticleCostRow, GeneralCostRow } from "@/types/purchase";
import { useQuery } from "@tanstack/react-query";

export interface CostListingFilters {
  search?: string;
  /** Con agrupación el cursor avanza por grupos completos. */
  group_by?: string;
}

/**
 * Costos de artículos aeronáuticos. Es el único listado de artículos que
 * lleva costo, y el servidor exige el rol en la ruta.
 */
export const useArticleCosts = (
  filters: CostListingFilters & { category: string },
  enabled: boolean,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<ArticleCostRow>({
    queryKey: [
      "warehouse-articles",
      selectedCompany?.slug,
      selectedStation,
      "costs",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/purchase/costs/articles`,
    params: { ...filters },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    initialPageSize: 25,
  });
};

/**
 * Costos de artículos generales: costo vigente, la unidad en que se registró
 * y las conversiones para expresarlo por unidad base.
 */
export const useGeneralArticleCosts = (
  filters: CostListingFilters,
  enabled: boolean,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useCursorListing<GeneralCostRow>({
    queryKey: [
      "general-articles",
      selectedCompany?.slug,
      selectedStation,
      "costs",
    ],
    url: `/${selectedCompany?.slug}/${selectedStation}/purchase/costs/general-articles`,
    params: { ...filters },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    initialPageSize: 25,
  });
};

/**
 * Historial de costo de un artículo general. Se pide al abrir la hoja, en vez
 * de viajar con cada fila del listado.
 */
export const useGeneralArticleCostHistory = (id: number | null) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<{ id: number; history: GeneralArticleCostHistoryEntry[] }>({
    queryKey: ["general-articles", selectedCompany?.slug, "cost-history", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/purchase/costs/general-articles/${id}/history`,
      );
      return data;
    },
    enabled: id !== null && !!selectedCompany,
  });
};
