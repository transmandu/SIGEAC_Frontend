import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalRiskCountByDateRange = async (
  from: string,
  to: string,
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/total-risk/count-by-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalRiskCountByDateRange = (
  from: string,
  to: string,
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/total-risk/count-by-date-range?from=${from}&to=${to}",
    ],
    queryFn: () => fetchTotalRiskCountByDateRange(from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
