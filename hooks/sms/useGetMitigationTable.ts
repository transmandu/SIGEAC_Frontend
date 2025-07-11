import axiosInstance from "@/lib/axios";
import { MitigationTable } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMitigationTable = async (
  company: string | null
): Promise<MitigationTable[]> => {
  const { data } = await axiosInstance.get(`/${company}/sms/analysis`);
  return data;
};

export const useGetMitigationTable = (company: string | null) => {
  return useQuery<MitigationTable[]>({
    queryKey: ["analysis"],
    queryFn: () => fetchMitigationTable(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
