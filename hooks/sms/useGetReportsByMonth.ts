import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchReportsNumberByMonth = async (
  company: string | null,
  from: string,
  to: string,
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/reports-number-by-month?from=${from}&to=${to}`
  );
  return data;
};

export const useGetReportsNumberByMonth = (
  company: string | null,
  from: string,
  to: string,
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["reports-number-by-month", company, from, to], // Incluye el ID en la clave de la query
    queryFn: () => fetchReportsNumberByMonth(company, from, to), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!from && !!to,
  });
};
