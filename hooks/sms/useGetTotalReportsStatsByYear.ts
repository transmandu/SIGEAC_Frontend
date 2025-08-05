import axiosInstance from "@/lib/axios";
import { GeneralStats } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportStatsByYear = async (
  from: string,
  to: string,
  company?: string
) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-reports-stats-by-year?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalReportsStatsByYear = (
  from: string,
  to: string,
  company?: string
) => {
  return useQuery<GeneralStats>({
    queryKey: ["total-reports-stats-by-year", from, to], // Incluye el ID en la clave de la query
    queryFn: () => fetcVoluntaryReportStatsByYear(from, to, company), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
