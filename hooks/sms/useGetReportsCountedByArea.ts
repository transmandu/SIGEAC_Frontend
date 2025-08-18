import axiosInstance from "@/lib/axios";
import { pieChartData, ReportsByArea } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcReportsCountedByArea = async (
  company: string | null,
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/reports/counted-by-area?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetReportsCountedByArea = (
  company: string | null,
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["reports-counted-by-area"], // Incluye el ID en la clave de la query
    queryFn: () => fetcReportsCountedByArea(company, from, to, reportType), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
