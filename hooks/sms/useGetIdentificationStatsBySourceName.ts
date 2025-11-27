import axiosInstance from "@/lib/axios";
import { pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchIdentificationStatsBySourceName = async (
  company: string | null,
  from: string,
  to: string,
  reportType: string
): Promise<pieChartData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/danger-identifications-information-source-count-by-name?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetIdentificationStatsBySourceName = (
  company: string | null,
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: [
      "danger-identifications-information-source-count-by-name",
      company,
      from,
      to,
      reportType,
    ],
    queryFn: () =>
      fetchIdentificationStatsBySourceName(company, from, to, reportType),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
