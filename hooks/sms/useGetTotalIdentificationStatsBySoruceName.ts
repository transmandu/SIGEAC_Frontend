import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalIdentificationStatsBySourceName = async (
  company: string | null,
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-danger-identifications/information-source/count-by-name?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalIdentificationStatsBySourceName = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/total-danger-identifications/information-source/count-by-name?from=${from}&to=${to}",
    ],
    queryFn: () => fetchTotalIdentificationStatsBySourceName(company, from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
