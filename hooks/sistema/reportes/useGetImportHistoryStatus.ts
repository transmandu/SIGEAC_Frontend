import axiosInstance from "@/lib/axios";
import { ErrorReportImport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const ACTIVE_STATUSES = ["queued", "running"];

const fetchImportHistoryStatus = async (id: number): Promise<ErrorReportImport> => {
  const { data } = await axiosInstance.get(`/error-reports/import-history/${id}`);
  return data.data ?? data;
};

export const useGetImportHistoryStatus = (id: number, enabled: boolean = true) => {
  return useQuery<ErrorReportImport, Error>({
    queryKey: ["error-report-imports", id],
    queryFn: () => fetchImportHistoryStatus(id),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 5000 : false;
    },
  });
};
