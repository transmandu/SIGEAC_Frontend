import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchPostRiskCountByDateRange = async (
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/post-risk/count-by-date-range?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetPostRiskCountByDateRange = (
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/post-risk/count-by-date-range?from=${from}&to=${to}",
    ],
    queryFn: () => fetchPostRiskCountByDateRange(from, to, reportType),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
