import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchPostRiskCountByDateRange = async (
  company: string | null,
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/post-risk-count-by-date-range?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetPostRiskCountByDateRange = (
  company: string | null,
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["post-risk-count-by-date-range"],
    queryFn: () => fetchPostRiskCountByDateRange(company, from, to, reportType),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
