import axiosInstance from "@/lib/axios";
import { AverageReportsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchObligatoryReportAverage = async (
  company: string | null,
  from_first: string,
  to_first: string,
  from_second: string,
  to_second: string
): Promise<AverageReportsResponse> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/obligatory-reports-average-by-date-range?from_first=${from_first}&to_first=${to_first}&from_second=${from_second}&to_second=${to_second}`
  );
  return data;
};

export const useGetObligatoryReportAverage = (
  company: string | null,
  from_first: string,
  to_first: string,
  from_second: string,
  to_second: string
) => {
  return useQuery<AverageReportsResponse>({
    queryKey: ["obligatory-reports-average-by-date-range"],
    queryFn: () =>
      fetchObligatoryReportAverage(
        company,
        from_first,
        to_first,
        from_second,
        to_second
      ),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
