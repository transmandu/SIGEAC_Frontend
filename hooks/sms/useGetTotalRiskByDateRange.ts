import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalRiskCountByDateRange = async (
  from: string,
  to: string,
  company?: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-risk-count-by-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalRiskCountByDateRange = (
  from: string,
  to: string,
  company?: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-risk-count-by-date-range",company, from, to],
    queryFn: () => fetchTotalRiskCountByDateRange(from, to, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
