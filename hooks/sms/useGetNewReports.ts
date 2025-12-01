import axiosInstance from "@/lib/axios";
import { ObligatoryReport, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface NewReports {
  voluntary: VoluntaryReport[];
  obligatory: ObligatoryReport[];
}

const fetchNewReports = async (company?: string): Promise<NewReports> => {
  const { data } = await axiosInstance.get(`/${company}/sms/new-reports`);
  return data;
};

export const useGetNewReports = (company?: string) => {
  return useQuery<NewReports>({
    queryKey: ["new-reports", company],
    queryFn: () => fetchNewReports(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
