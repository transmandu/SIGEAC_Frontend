import axiosInstance from "@/lib/axios";
import { GeneralStats } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportStatsByYear = async (
  company: string | null,
  from: string,
  to: string,
  reportType: string
) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/reports/stats-by-year?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetVoluntaryReportingStatsByYear = (
  company: string | null,
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<GeneralStats>({
    queryKey: ["reports-stats-by-year"], // Incluye el ID en la clave de la query
    queryFn: () =>
      fetcVoluntaryReportStatsByYear(company, from, to, reportType), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
