import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalIdentificationStatsBySourceName = async (
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/total-danger-identifications/information-source/count-by-name?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalIdentificationStatsBySourceName = (
  from: string,
  to: string,
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/total-danger-identifications/information-source/count-by-name?from=${from}&to=${to}",
    ],
    queryFn: () => fetchTotalIdentificationStatsBySourceName(from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
