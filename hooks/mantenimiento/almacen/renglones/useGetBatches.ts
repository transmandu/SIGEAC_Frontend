import axiosInstance from "@/lib/axios";
import { Batch } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBatches = async (company?: string): Promise<Batch[]> => {
  const { data } = await axiosInstance.get(`/${company}/batches`);
  return data;
};

export const useGetBatches = (company?: string) => {
  return useQuery<Batch[]>({
    queryKey: ["batches", company],
    queryFn: () => fetchBatches(company!),
    enabled: !!company,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
