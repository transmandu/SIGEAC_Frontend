import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalIdentificationStatsBySourceType = async (
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/total-danger-identifications/information-source/count-by-type?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalIdentificationStatsBySourceType = (
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/sms/total-danger-identifications/information-source/count-by-type?from=${from}&to=${to}",
    ],
    queryFn: () => fetchTotalIdentificationStatsBySourceType(from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
