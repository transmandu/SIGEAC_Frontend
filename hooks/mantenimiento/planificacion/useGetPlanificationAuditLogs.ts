import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  PaginatedAuditOperations,
  PlanificationAuditFilters,
} from "@/types/planification/audit";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const auditParams = (filters: PlanificationAuditFilters) => ({
  ...filters,
  critical_only: filters.critical_only ? 1 : undefined,
});

const fetchPlanificationAuditLogs = async (
  company: string | undefined,
  filters: PlanificationAuditFilters,
): Promise<PaginatedAuditOperations> => {
  const { data } = await axiosInstance.get(
    `/${company}/planification-audit-logs`,
    { params: auditParams(filters) },
  );

  return data;
};

export const useGetPlanificationAuditLogs = (
  filters: PlanificationAuditFilters,
  enabled = true,
) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<PaginatedAuditOperations, Error>({
    queryKey: ["planification-audit-logs", selectedCompany?.slug, filters],
    queryFn: () => fetchPlanificationAuditLogs(selectedCompany?.slug, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    enabled: enabled && !!selectedCompany?.slug,
  });
};
