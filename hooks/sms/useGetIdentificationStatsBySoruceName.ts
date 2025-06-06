import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchIdentificationStatsBySourceName = async (
  from: string,
  to: string,
  reportType: string,
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/danger-identifications/information-source/count-by-name?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetIdentificationStatsBySourceName = (from: string, to: string, reportType: string) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/danger-identifications/information-source/count-by-name?reportType=${reportType}&from=${from}&to=${to}",
    ],
    queryFn: () => fetchIdentificationStatsBySourceName(from, to,reportType),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
