import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalPostRiskCountByDateRange = async (
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/total-post-risk/count-by-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalPostRiskCountByDateRange = (
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/total-post-risk/count-by-date-range?from=${from}&to=${to}",
    ],
    queryFn: () => fetchTotalPostRiskCountByDateRange(from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
