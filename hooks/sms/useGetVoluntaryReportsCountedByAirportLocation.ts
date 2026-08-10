import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcVoluntaryReportsCountedByAirportLocation = async (
  company: string | null,
  from: string,
  to: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/voluntary-reports-counted-by-airport-location?from=${from}&to=${to}`
  );
  return data;
};

export const useGetVoluntaryReportsCountedByAirportLocation = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "voluntary-reports-counted-by-airport-location",
    ],
    queryFn: () =>
      fetcVoluntaryReportsCountedByAirportLocation(company, from, to),
    staleTime: 1000 * 60 * 5,
  });
};
