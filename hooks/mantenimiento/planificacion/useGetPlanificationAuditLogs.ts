import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  PaginatedAuditLogs,
  PlanificationAuditFilters,
} from "@/types/planification/audit";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const fetchPlanificationAuditLogs = async (
  company: string | undefined,
  filters: PlanificationAuditFilters,
): Promise<PaginatedAuditLogs> => {
  const { data } = await axiosInstance.get(
    `/${company}/planification-audit-logs`,
    {
      params: {
        ...filters,
        critical_only: filters.critical_only ? 1 : undefined,
      },
    },
  );

  return data;
};

export const useGetPlanificationAuditLogs = (
  filters: PlanificationAuditFilters,
) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<PaginatedAuditLogs, Error>({
    queryKey: ["planification-audit-logs", selectedCompany?.slug, filters],
    queryFn: () => fetchPlanificationAuditLogs(selectedCompany?.slug, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    enabled: !!selectedCompany?.slug,
  });
};
