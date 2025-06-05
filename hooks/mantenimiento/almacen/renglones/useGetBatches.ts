import axiosInstance from "@/lib/axios";
import { Batch, Company } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBatches = async (): Promise<Batch[]> => {
  const { data } = await axiosInstance.get("/hangar74/batches");
  return data;
};

export const useGetBatches = () => {
  return useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: fetchBatches,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
