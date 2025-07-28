import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalRiskCountByDateRange = async (
  company: string | null,
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-risk/count-by-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalRiskCountByDateRange = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "total-risk-count-by-date-range",
    ],
    queryFn: () => fetchTotalRiskCountByDateRange(company, from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
