import axiosInstance from "@/lib/axios";
import { ObligatoryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchObligatoryReports = async (
  company?: string
): Promise<ObligatoryReport[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/obligatory-reports`
  );
  return data;
};

export const useGetObligatoryReports = (company?: string) => {
  return useQuery<ObligatoryReport[]>({
    queryKey: ["obligatory-reports"],
    queryFn: () => fetchObligatoryReports(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
