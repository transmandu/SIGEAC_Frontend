import axiosInstance from "@/lib/axios";
import { ErrorReportImport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchImportHistoryList = async (): Promise<ErrorReportImport[]> => {
  const { data } = await axiosInstance.get("/error-reports/import-history");
  return data.data ?? data;
};

export const useGetImportHistoryList = () => {
  return useQuery<ErrorReportImport[], Error>({
    queryKey: ["error-report-imports"],
    queryFn: fetchImportHistoryList,
  });
};
