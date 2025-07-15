import axiosInstance from "@/lib/axios";
import { ReportingStats } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportStatsByYear = async (
  company: string | null,
  from: string,
  to: string
) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-reports-stats-by-year?from=${from}&to=${to}`
  );
  console.log("useGetTotalReportsStatsByYear",data);
  return data;
};

export const useGetTotalReportsStatsByYear = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<ReportingStats>({
    queryKey: ["total-reports-stats-by-year", from, to], // Incluye el ID en la clave de la query
    queryFn: () => fetcVoluntaryReportStatsByYear(company, from, to), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
