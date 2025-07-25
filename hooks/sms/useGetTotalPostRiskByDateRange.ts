import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalPostRiskCountByDateRange = async (
  company: string | null,
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-post-risk/count-by-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalPostRiskCountByDateRange = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-post-risk-count-by-date-range"],
    queryFn: () => fetchTotalPostRiskCountByDateRange(company, from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
