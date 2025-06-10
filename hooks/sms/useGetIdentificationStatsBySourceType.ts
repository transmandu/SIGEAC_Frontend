import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchIdentificationStatsBySourceType = async (
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/danger-identifications/information-source/count-by-type?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetIdentificationStatsBySourceType = (
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/transmandu/sms/danger-identifications/information-source/count-by-type?reportType=${reportType}&from=${from}&to=${to}",
    ],
    queryFn: () => fetchIdentificationStatsBySourceType(from, to, reportType),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
