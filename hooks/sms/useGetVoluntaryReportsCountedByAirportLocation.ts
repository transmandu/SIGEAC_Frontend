import axiosInstance from "@/lib/axios";
import { pieChartData, ReportsByArea } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportsCountedByAirportLocation = async (
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/voluntary-reports/counted-by-airport-location?from=${from}&to=${to}`
  );
  return data;
};

export const useGetVoluntaryReportsCountedByAirportLocation = (
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "voluntary-reports/counted-by-airport-location?from=${from}&to=${to}",
    ], // Incluye el ID en la clave de la query
    queryFn: () => fetcVoluntaryReportsCountedByAirportLocation(from, to), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
