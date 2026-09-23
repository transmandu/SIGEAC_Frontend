import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  AuditTypeFilter,
  PlanificationAuditStats,
} from "@/types/planification/audit";
import { QueryClient, keepPreviousData, useQuery } from "@tanstack/react-query";

// Toda edición de vuelos u órdenes deja un log: la auditoría debe verlo sin
// esperar a que venza su staleTime.
export const invalidatePlanificationAudit = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["planification-audit-logs"] });
  queryClient.invalidateQueries({ queryKey: ["planification-audit-stats"] });
};

interface StatsFilters {
  from?: string;
  to?: string;
  type?: AuditTypeFilter;
}

const fetchPlanificationAuditStats = async (
  company: string | undefined,
  filters: StatsFilters,
): Promise<PlanificationAuditStats> => {
  const { data } = await axiosInstance.get(
    `/${company}/planification-audit-logs/stats`,
    {
      params: filters,
    },
  );

  return data;
};

export const useGetPlanificationAuditStats = (filters: StatsFilters) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<PlanificationAuditStats, Error>({
    queryKey: ["planification-audit-stats", selectedCompany?.slug, filters],
    queryFn: () => fetchPlanificationAuditStats(selectedCompany?.slug, filters),
    // Agregados de meses: no cambian de un minuto a otro y recalcularlos en
    // cada foco de ventana es trabajo pesado para el servidor.
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    enabled: !!selectedCompany?.slug,
  });
};
