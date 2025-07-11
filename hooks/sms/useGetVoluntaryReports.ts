import axiosInstance from "@/lib/axios";
import { VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchVoluntaryReports = async (company: string | null): Promise<VoluntaryReport[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/voluntary-reports`);
  return data;
};

export const useGetVoluntaryReports = (company: string | null) => {
  return useQuery<VoluntaryReport[]>({
    queryKey: ["voluntary-reports"],
    queryFn: ()=> fetchVoluntaryReports(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
