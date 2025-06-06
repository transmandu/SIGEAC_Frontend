import axiosInstance from "@/lib/axios";
import { pieChartData, ReportsByArea } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcReportsCountedByArea = async (
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/reports/counted-by-area?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetReportsCountedByArea = (
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "/reports/counted-by-area?reportType={reportType}from=${from}&to=${to}",
    ], // Incluye el ID en la clave de la query
    queryFn: () => fetcReportsCountedByArea(from, to, reportType), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
