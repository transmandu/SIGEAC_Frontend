import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalReportsCountedByArea = async (
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/total-reports/counted-by-area?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalReportsCountedByArea = (from: string, to: string) => {
  return useQuery<pieChartData[]>({
    queryKey: ["/total-reports/counted-by-area?from=${from}&to=${to}"], // Incluye el ID en la clave de la query
    queryFn: () => fetchTotalReportsCountedByArea(from, to), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
