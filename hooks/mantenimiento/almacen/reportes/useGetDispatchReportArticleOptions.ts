import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { DispatchReportArticleOptions } from "@/types/inventory/queues";
import { useQuery } from "@tanstack/react-query";

/**
 * Opciones de los filtros de artículo del reporte de despacho: valores
 * distintos de lo despachado en la sede. Reemplaza a descargar todo el
 * inventario almacenado solo para armar estas listas en el navegador.
 */
export const useGetDispatchReportArticleOptions = (enabled: boolean = true) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<DispatchReportArticleOptions>({
    queryKey: [
      "dispatch-report-article-options",
      selectedCompany?.slug,
      selectedStation,
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/dispatch-report/article-options`,
      );
      return data;
    },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    staleTime: 1000 * 60 * 5,
  });
};
