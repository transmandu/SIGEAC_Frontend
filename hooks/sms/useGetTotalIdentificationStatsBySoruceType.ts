import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalIdentificationStatsBySourceType = async (
  company: string | null,
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-danger-identifications/information-source/count-by-type?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalIdentificationStatsBySourceType = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-danger-identifications-information-source-count-by-type"],
    queryFn: () => fetchTotalIdentificationStatsBySourceType(company, from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
