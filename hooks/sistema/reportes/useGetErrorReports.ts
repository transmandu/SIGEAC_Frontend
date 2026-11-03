import axiosInstance from "@/lib/axios";
import { ErrorReport, ErrorReportSeverity, ErrorReportStatus } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface ErrorReportFilters {
  status?: ErrorReportStatus;
  module?: string;
  severity?: ErrorReportSeverity;
  from?: string;
  to?: string;
  resolved_from?: string;
  resolved_to?: string;
  /** Texto contenido en la descripción. */
  search?: string;
  /** Solo los reportes del propio usuario, aunque sea SUPERUSER. */
  mine?: boolean;
  page?: number;
  per_page?: number;
}

export interface ErrorReportsResponse {
  reports: ErrorReport[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const fetchErrorReports = async (
  filters: ErrorReportFilters,
): Promise<ErrorReportsResponse> => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.module) params.set("module", filters.module);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.resolved_from) params.set("resolved_from", filters.resolved_from);
  if (filters.resolved_to) params.set("resolved_to", filters.resolved_to);
  if (filters.search) params.set("search", filters.search);
  if (filters.mine) params.set("mine", "1");
  params.set("page", String(filters.page ?? 1));
  params.set("per_page", String(filters.per_page ?? 25));

  const { data } = await axiosInstance.get(
    `/error-reports?${params.toString()}`,
  );

  return {
    reports: data.data ?? [],
    pagination: {
      current_page: data.current_page,
      total: data.total,
      per_page: data.per_page,
      last_page: data.last_page,
    },
  };
};

/**
 * `keepPrevious` conserva la página anterior mientras llega la siguiente, para
 * que paginar no vuelva a pintar el esqueleto en cada clic.
 */
export const useGetErrorReports = (
  filters: ErrorReportFilters,
  options: { keepPrevious?: boolean } = {},
) => {
  return useQuery<ErrorReportsResponse, Error>({
    queryKey: ["error-reports", filters],
    queryFn: () => fetchErrorReports(filters),
    staleTime: 0,
    placeholderData: options.keepPrevious ? keepPreviousData : undefined,
  });
};
