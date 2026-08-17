import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalReportsCountedByArea = async (
  from: string,
  to: string,
  company?: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-reports-counted-by-area?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalReportsCountedByArea = (
  from: string,
  to: string,
  company?: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-reports-counted-by-area",company, from, to],
    queryFn: () => fetchTotalReportsCountedByArea(from, to, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
