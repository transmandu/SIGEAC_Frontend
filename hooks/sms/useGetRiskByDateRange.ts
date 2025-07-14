import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchRiskCountByDateRange = async (
  company: string | null,
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/risk/count-by-date-range?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetRiskCountByDateRange = (
  company: string | null,
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/risk/count-by-date-range?reportType=${reportType}&from=${from}&to=${to}",
    ],
    queryFn: () => fetchRiskCountByDateRange(company, from, to, reportType),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
