import axiosInstance from "@/lib/axios";
import { DangerIdentificationsByType, pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalDangerIdentificationsCountedByType = async (
  from: string,
  to: string,
  company?: string,
) => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/total-danger-identifications/counted-by-type?from=${from}&to=${to}`
  );
  return data;
};

export const useGetTotalDangerIdentificationsCountedByType = (
  from: string,
  to: string,
  company?: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-danger-identifications-counted-by-type",company, from, to],
    queryFn: () =>
      fetchTotalDangerIdentificationsCountedByType(from, to, company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
