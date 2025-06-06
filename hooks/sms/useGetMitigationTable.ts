import axiosInstance from "@/lib/axios";
import {  MitigationTable } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMitigationTable = async (): Promise<MitigationTable[]> => {
  const { data } = await axiosInstance.get("/transmandu/sms/analysis");
  return data;
};

export const useGetMitigationTable = () => {
  return useQuery<MitigationTable[]>({
    queryKey: ["analysis"],
    queryFn: fetchMitigationTable,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
