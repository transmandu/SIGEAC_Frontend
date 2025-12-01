import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalIdentificationStatsBySourceName = async (
  from: string,
  to: string,
  company?: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-danger-identifications-information-source-count-by-name?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalIdentificationStatsBySourceName = (
  from: string,
  to: string,
  company?: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-danger-identifications-information-source-count-by-name",company, from, to],
    queryFn: () => fetchTotalIdentificationStatsBySourceName(from, to, company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
