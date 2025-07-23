import axiosInstance from "@/lib/axios";
import { VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchVoluntaryReportsByDateRange = async (
  company: string | null,
  from: string,
  to: string
) => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/voluntary-reports-date-range?from=${from}&to=${to}`
  );
  return data;
};

export const useGetVoluntaryReportsByDateRange = (
  company: string | null,
  from: string,
  to: string
) => {
  return useQuery<VoluntaryReport[]>({
    queryKey: ["voluntary-reports-by-date-range"],
    queryFn: () => fetchVoluntaryReportsByDateRange(company,from, to),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
