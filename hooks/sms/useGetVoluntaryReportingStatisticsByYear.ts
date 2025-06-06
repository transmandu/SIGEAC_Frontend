import axiosInstance from "@/lib/axios";
import { ReportingStats } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportStatsByYear = async (
  from: string,
  to: string,
  reportType: string
) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/reports/stats-by-year?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetVoluntaryReportingStatsByYear = (
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<ReportingStats>({
    queryKey: ["/reports/stats-by-year", from, to, reportType], // Incluye el ID en la clave de la query
    queryFn: () => fetcVoluntaryReportStatsByYear(from, to, reportType), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
