import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { QuarantineRecord, QuarantineStatusFilter } from "@/types/quarantine";
import { useQuery } from "@tanstack/react-query";

const fetchQuarantineArticles = async (
  company?: string,
  status?: QuarantineStatusFilter,
  locationId?: string | number,
): Promise<QuarantineRecord[]> => {
  const { data } = await axiosInstance.get(`/${company}/quarantine-articles`, {
    params: {
      // ALL es del filtro de la vista, no del backend: allí "sin status"
      // ya significa todos.
      ...(status && status !== "ALL" ? { status } : {}),
      ...(locationId ? { location_id: locationId } : {}),
    },
  });

  return data;
};

/**
 * Registros del ciclo de cuarentena. Ninguno de los dos módulos que lo consume
 * es exclusivo de un estado: compras necesita ver lo que ya corrigió y calidad
 * lo que sigue esperando corrección, así que el estado lo decide el llamador.
 */
export const useGetQuarantineArticles = (
  status: QuarantineStatusFilter = "ALL",
  options?: { scopeToStation?: boolean; enabled?: boolean },
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  const locationId = options?.scopeToStation ? selectedStation : undefined;

  return useQuery<QuarantineRecord[]>({
    queryKey: ["quarantine-articles", selectedCompany?.slug, status, locationId ?? "all"],
    queryFn: () => fetchQuarantineArticles(selectedCompany?.slug, status, locationId),
    staleTime: 1000 * 60 * 2,
    // El llamador puede apagarla: las alertas la montan en todo el layout y sin
    // esto pedía cuarentena para cualquier usuario, incluso los tenants que no
    // llevan el ciclo y responden 404.
    enabled: (options?.enabled ?? true) && !!selectedCompany?.slug,
  });
};
