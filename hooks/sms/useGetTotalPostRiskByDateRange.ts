import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalPostRiskCountByDateRange = async (
  from: string,
  to: string,
  company?: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-post-risk/count-by-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalPostRiskCountByDateRange = (
  from: string,
  to: string,
  company?: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-post-risk-count-by-date-range",company, from, to],
    queryFn: () => fetchTotalPostRiskCountByDateRange(from, to, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
