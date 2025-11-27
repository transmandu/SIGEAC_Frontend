import axiosInstance from "@/lib/axios";
import { MitigationTable } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMitigationTable = async (
  company?: string
): Promise<MitigationTable[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/analysis`);
  return data;
};

export const useGetMitigationTable = (company?: string) => {
  return useQuery<MitigationTable[]>({
    queryKey: ["analysis", company],
    queryFn: () => fetchMitigationTable(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
